-- Create a users table to mirror data from auth.users
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if users table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
    ) THEN
        -- Create users table
        CREATE TABLE public.users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE,
            full_name TEXT,
            department TEXT,
            station TEXT,
            designation TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Add RLS policies
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Create policy for admins
        CREATE POLICY "Admins can do anything with users"
        ON public.users
        USING (
            EXISTS (
                SELECT 1 FROM public.user_roles ur
                JOIN public.roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
            )
        );

        -- Create policy for users to read all users
        CREATE POLICY "Users can read all users"
        ON public.users
        FOR SELECT
        USING (true);
        
        -- Create policy for users to update their own data
        CREATE POLICY "Users can update their own data"
        ON public.users
        FOR UPDATE
        USING (id = auth.uid());
    END IF;
    
    -- Populate users table from auth.users if it's empty
    IF (SELECT COUNT(*) FROM public.users) = 0 THEN
        INSERT INTO public.users (id, email, full_name, department, station, designation, created_at, updated_at)
        SELECT 
            id,
            email,
            raw_user_meta_data->>'full_name',
            raw_user_meta_data->>'department',
            raw_user_meta_data->>'station',
            raw_user_meta_data->>'designation',
            created_at,
            updated_at
        FROM auth.users
        WHERE raw_user_meta_data->>'full_name' IS NOT NULL
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    -- Create a trigger to keep users table in sync with auth.users
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'sync_auth_users_to_public_users'
    ) THEN
        CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                INSERT INTO public.users (
                    id, 
                    email, 
                    full_name, 
                    department, 
                    station, 
                    designation, 
                    created_at, 
                    updated_at
                )
                VALUES (
                    NEW.id,
                    NEW.email,
                    NEW.raw_user_meta_data->>'full_name',
                    NEW.raw_user_meta_data->>'department',
                    NEW.raw_user_meta_data->>'station',
                    NEW.raw_user_meta_data->>'designation',
                    NEW.created_at,
                    NEW.updated_at
                )
                ON CONFLICT (id) 
                DO UPDATE SET
                    email = EXCLUDED.email,
                    full_name = EXCLUDED.full_name,
                    department = EXCLUDED.department,
                    station = EXCLUDED.station,
                    designation = EXCLUDED.designation,
                    updated_at = EXCLUDED.updated_at;
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                DELETE FROM public.users WHERE id = OLD.id;
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE TRIGGER sync_auth_users_to_public_users
        AFTER INSERT OR UPDATE OR DELETE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION sync_auth_user_to_public();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create the users table
SELECT create_users_table_if_not_exists();

-- Update the create_user function to also insert into public.users
CREATE OR REPLACE FUNCTION create_user(
    p_email TEXT,
    p_full_name TEXT,
    p_department TEXT DEFAULT NULL,
    p_station TEXT DEFAULT NULL,
    p_designation TEXT DEFAULT NULL,
    p_role_name TEXT DEFAULT 'User'
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_role_id UUID;
    v_metadata JSONB;
BEGIN
    -- Ensure roles exist
    PERFORM create_roles_if_not_exists();
    
    -- Ensure users table exists
    PERFORM create_users_table_if_not_exists();

    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email;

    -- Create user metadata
    v_metadata := jsonb_build_object(
        'full_name', p_full_name
    );

    -- Add optional fields to metadata if they're not null
    IF p_department IS NOT NULL THEN
        v_metadata := v_metadata || jsonb_build_object('department', p_department);
    END IF;

    IF p_station IS NOT NULL THEN
        v_metadata := v_metadata || jsonb_build_object('station', p_station);
    END IF;

    IF p_designation IS NOT NULL THEN
        v_metadata := v_metadata || jsonb_build_object('designation', p_designation);
    END IF;

    -- Create user if they don't exist
    IF v_user_id IS NULL THEN
        -- Generate a UUID for the new user
        v_user_id := gen_random_uuid();

        -- Insert into auth.users
        INSERT INTO auth.users (
            id,
            email,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data
        )
        VALUES (
            v_user_id,
            p_email,
            now(),
            now(),
            now(),
            v_metadata
        );
        
        -- Insert into public.users (this should be handled by the trigger, but just to be safe)
        INSERT INTO public.users (
            id,
            email,
            full_name,
            department,
            station,
            designation,
            created_at,
            updated_at
        )
        VALUES (
            v_user_id,
            p_email,
            p_full_name,
            p_department,
            p_station,
            p_designation,
            now(),
            now()
        )
        ON CONFLICT (id) DO NOTHING;
    ELSE
        -- Update existing user's metadata
        UPDATE auth.users
        SET raw_user_meta_data = v_metadata,
            updated_at = now()
        WHERE id = v_user_id;
        
        -- Update public.users (this should be handled by the trigger, but just to be safe)
        UPDATE public.users
        SET 
            full_name = p_full_name,
            department = p_department,
            station = p_station,
            designation = p_designation,
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

    -- Get role ID
    SELECT id INTO v_role_id
    FROM public.roles
    WHERE name = p_role_name;

    -- If role doesn't exist, use 'User' role
    IF v_role_id IS NULL THEN
        SELECT id INTO v_role_id
        FROM public.roles
        WHERE name = 'User';
        
        -- If still no role, create one
        IF v_role_id IS NULL THEN
            INSERT INTO public.roles (name, description)
            VALUES ('User', 'Regular user with limited access')
            RETURNING id INTO v_role_id;
        END IF;
    END IF;

    -- Assign role to user if not already assigned
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 