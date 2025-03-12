-- Function to create roles if they don't exist
CREATE OR REPLACE FUNCTION create_roles_if_not_exists()
RETURNS void AS $$
BEGIN
    -- Check if roles table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'roles'
    ) THEN
        -- Create roles table
        CREATE TABLE public.roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Insert default roles
        INSERT INTO public.roles (name, description)
        VALUES 
            ('Admin', 'Administrator with full access'),
            ('User', 'Regular user with limited access');
    END IF;
    
    -- Check if user_roles table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_roles'
    ) THEN
        -- Create user_roles table
        CREATE TABLE public.user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id, role_id)
        );
        
        -- Add RLS policies
        ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
        
        -- Create policy for admins
        CREATE POLICY "Admins can do anything with user_roles"
        ON public.user_roles
        USING (
            EXISTS (
                SELECT 1 FROM public.user_roles ur
                JOIN public.roles r ON ur.role_id = r.id
                WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
            )
        );
        
        -- Create policy for users to read their own roles
        CREATE POLICY "Users can read their own roles"
        ON public.user_roles
        FOR SELECT
        USING (user_id = auth.uid());
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a user in auth.users and assign a role
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
    ELSE
        -- Update existing user's metadata
        UPDATE auth.users
        SET raw_user_meta_data = v_metadata,
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

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role_name TEXT;
BEGIN
    SELECT r.name INTO v_role_name
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
    LIMIT 1;
    
    RETURN COALESCE(v_role_name, 'User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(p_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = p_role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 