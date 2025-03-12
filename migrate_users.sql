-- Migrate users from standalone_users to user_roles table
-- This script will:
-- 1. Create users in the auth.users table if they don't exist
-- 2. Add entries to the user_roles table
-- 3. Preserve all user data during migration

-- First, create a temporary table to track migration status
CREATE TEMP TABLE migration_status (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  status TEXT,
  auth_user_id UUID,
  error TEXT
);

-- Insert all standalone users into our tracking table
INSERT INTO migration_status (id, full_name, email, status)
SELECT id, full_name, email, 'pending'
FROM standalone_users;

-- For users with emails, create auth.users entries if they don't exist
DO $$
DECLARE
  user_record RECORD;
  new_auth_id UUID;
BEGIN
  FOR user_record IN 
    SELECT id, full_name, email 
    FROM migration_status 
    WHERE email IS NOT NULL AND email != ''
  LOOP
    BEGIN
      -- Check if user with this email already exists in auth.users
      SELECT id INTO new_auth_id FROM auth.users WHERE email = user_record.email LIMIT 1;
      
      IF new_auth_id IS NULL THEN
        -- Create a new user in auth.users with a random password (they'll need to reset)
        -- Note: In production, you might want to use a different approach
        INSERT INTO auth.users (
          email,
          email_confirmed_at,
          instance_id,
          confirmation_token,
          recovery_token,
          created_at,
          updated_at
        ) VALUES (
          user_record.email,
          NOW(),
          '00000000-0000-0000-0000-000000000000',
          '',
          '',
          NOW(),
          NOW()
        ) RETURNING id INTO new_auth_id;
      END IF;
      
      -- Update our migration status with the auth user id
      UPDATE migration_status 
      SET auth_user_id = new_auth_id, status = 'auth_created' 
      WHERE id = user_record.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log any errors
      UPDATE migration_status 
      SET status = 'error', error = SQLERRM 
      WHERE id = user_record.id;
    END;
  END LOOP;
END;
$$;

-- For users without emails, generate placeholder emails based on their names
DO $$
DECLARE
  user_record RECORD;
  placeholder_email TEXT;
  new_auth_id UUID;
  counter INT;
BEGIN
  FOR user_record IN 
    SELECT id, full_name 
    FROM migration_status 
    WHERE (email IS NULL OR email = '') AND status = 'pending'
  LOOP
    BEGIN
      -- Create a placeholder email from the name
      placeholder_email := LOWER(REGEXP_REPLACE(user_record.full_name, '[^a-zA-Z0-9]', '', 'g')) || '@placeholder.local';
      
      -- Check if this placeholder email already exists
      counter := 1;
      WHILE EXISTS (SELECT 1 FROM auth.users WHERE email = placeholder_email) LOOP
        placeholder_email := LOWER(REGEXP_REPLACE(user_record.full_name, '[^a-zA-Z0-9]', '', 'g')) || counter || '@placeholder.local';
        counter := counter + 1;
      END LOOP;
      
      -- Create auth user with placeholder email
      INSERT INTO auth.users (
        email,
        email_confirmed_at,
        instance_id,
        confirmation_token,
        recovery_token,
        created_at,
        updated_at
      ) VALUES (
        placeholder_email,
        NOW(),
        '00000000-0000-0000-0000-000000000000',
        '',
        '',
        NOW(),
        NOW()
      ) RETURNING id INTO new_auth_id;
      
      -- Update migration status
      UPDATE migration_status 
      SET auth_user_id = new_auth_id, 
          email = placeholder_email,
          status = 'auth_created_with_placeholder' 
      WHERE id = user_record.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log any errors
      UPDATE migration_status 
      SET status = 'error', error = SQLERRM 
      WHERE id = user_record.id;
    END;
  END LOOP;
END;
$$;

-- Now create entries in user_roles table
-- Assuming a default role_id - replace with your actual default role ID
DO $$
DECLARE
  default_role_id UUID := '00000000-0000-0000-0000-000000000000'; -- Replace with your default role ID
  user_record RECORD;
BEGIN
  -- Get the first role_id if default not specified
  IF default_role_id = '00000000-0000-0000-0000-000000000000' THEN
    SELECT id INTO default_role_id FROM roles LIMIT 1;
  END IF;
  
  FOR user_record IN 
    SELECT id, auth_user_id 
    FROM migration_status 
    WHERE status IN ('auth_created', 'auth_created_with_placeholder')
  LOOP
    BEGIN
      -- Skip if already in user_roles
      IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_record.auth_user_id) THEN
        -- Add to user_roles
        INSERT INTO user_roles (user_id, role_id)
        VALUES (user_record.auth_user_id, default_role_id);
        
        -- Update status
        UPDATE migration_status 
        SET status = 'completed' 
        WHERE id = user_record.id;
      ELSE
        -- Already exists
        UPDATE migration_status 
        SET status = 'already_in_user_roles' 
        WHERE id = user_record.id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log any errors
      UPDATE migration_status 
      SET status = 'error_adding_role', error = SQLERRM 
      WHERE id = user_record.id;
    END;
  END LOOP;
END;
$$;

-- Show migration results
SELECT status, COUNT(*) FROM migration_status GROUP BY status;

-- Show detailed results for review
SELECT * FROM migration_status;

-- Optional: If everything looks good, you can drop the standalone_users table
-- or rename it to standalone_users_backup
-- RENAME TABLE standalone_users TO standalone_users_backup;

-- Optional: Drop the temporary table
-- DROP TABLE migration_status; 