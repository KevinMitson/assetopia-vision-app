-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can do anything with users" ON public.users;
DROP POLICY IF EXISTS "Users can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

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

-- Populate users table from auth.users if it's empty
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

-- Create a function for the trigger
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

-- Create the trigger
DROP TRIGGER IF EXISTS sync_auth_users_to_public_users ON auth.users;

CREATE TRIGGER sync_auth_users_to_public_users
AFTER INSERT OR UPDATE OR DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_auth_user_to_public();

-- Create a function to manually sync users
CREATE OR REPLACE FUNCTION sync_all_users_to_public()
RETURNS void AS $$
BEGIN
    -- Clear existing users
    DELETE FROM public.users;
    
    -- Insert all users from auth.users
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
    FROM auth.users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add a test user
CREATE OR REPLACE FUNCTION add_test_user(
    p_email TEXT,
    p_full_name TEXT,
    p_department TEXT DEFAULT NULL,
    p_station TEXT DEFAULT NULL,
    p_designation TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Generate a UUID for the new user
    v_user_id := gen_random_uuid();
    
    -- Insert directly into public.users
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
    ON CONFLICT (email) 
    DO UPDATE SET
        full_name = EXCLUDED.full_name,
        department = EXCLUDED.department,
        station = EXCLUDED.station,
        designation = EXCLUDED.designation,
        updated_at = EXCLUDED.updated_at
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some test users
SELECT add_test_user('admin@example.com', 'Admin User', 'IT', 'HQ', 'System Administrator');
SELECT add_test_user('user1@example.com', 'John Smith', 'Operations', 'Terminal 1', 'Operator');
SELECT add_test_user('user2@example.com', 'Sarah Johnson', 'Maintenance', 'Workshop', 'Technician');
SELECT add_test_user('manager@example.com', 'Michael Brown', 'Operations', 'Terminal 2', 'Department Manager');
SELECT add_test_user('tech@example.com', 'Emily Davis', 'IT', 'HQ', 'Support Specialist'); 