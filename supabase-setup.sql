-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table first (if it doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert profile for the admin user
INSERT INTO profiles (id, full_name, email, is_admin)
VALUES ('7bd2e123-7e5a-437c-af7e-ce906dc8c12d', 'KevinMitson', 'kevinmitson9@gmail.com', TRUE)
ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Disable RLS for these tables (or configure appropriate policies)
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Insert Admin role if it doesn't exist
INSERT INTO roles (name, description)
VALUES ('Admin', 'System Administrator with full access')
ON CONFLICT (name) DO NOTHING;

-- Assign Admin role to the user (replace with your user ID)
INSERT INTO user_roles (user_id, role_id)
VALUES ('7bd2e123-7e5a-437c-af7e-ce906dc8c12d', (SELECT id FROM roles WHERE name = 'Admin'))
ON CONFLICT (user_id, role_id) DO NOTHING; 