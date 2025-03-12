-- Script to add test users directly to the user_roles table
-- This script will:
-- 1. Create roles if they don't exist
-- 2. Create users in auth.users
-- 3. Add entries to user_roles table

-- First, ensure our helper functions exist
\i create_user_function.sql

-- Ensure roles and user_roles tables exist
SELECT create_roles_if_not_exists();

-- Add test users using our create_user function
SELECT create_user(
    'admin@example.com',
    'Admin User',
    'IT',
    'HQ',
    'System Administrator',
    'Admin'
);

SELECT create_user(
    'user1@example.com',
    'Regular User',
    'Operations',
    'Terminal 1',
    'Operator',
    'User'
);

SELECT create_user(
    'user2@example.com',
    'Another User',
    'Maintenance',
    'Workshop',
    'Technician',
    'User'
);

SELECT create_user(
    'manager@example.com',
    'Department Manager',
    'Operations',
    'Terminal 2',
    'Manager',
    'Admin'
);

SELECT create_user(
    'tech@example.com',
    'Technical Support',
    'IT',
    'HQ',
    'Support Specialist',
    'User'
);

-- Display the users we've created
SELECT 
    u.id, 
    u.email, 
    u.raw_user_meta_data->>'full_name' as full_name,
    u.raw_user_meta_data->>'department' as department,
    u.raw_user_meta_data->>'station' as station,
    u.raw_user_meta_data->>'designation' as designation,
    r.name as role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
WHERE u.email LIKE '%example.com'
ORDER BY u.email; 