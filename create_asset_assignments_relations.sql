-- Script to add foreign key relationships between asset_assignments and users tables

-- First, check if the asset_assignments table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'asset_assignments'
    ) THEN
        -- Create the asset_assignments table if it doesn't exist
        CREATE TABLE public.asset_assignments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            asset_id UUID NOT NULL,
            assigned_to UUID NOT NULL,
            assigned_by UUID NOT NULL,
            assignment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
            expected_return_date TIMESTAMP WITH TIME ZONE,
            actual_return_date TIMESTAMP WITH TIME ZONE,
            status TEXT NOT NULL DEFAULT 'Active',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END
$$;

-- Add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Check if the assigned_to foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'asset_assignments_assigned_to_fkey'
        AND table_name = 'asset_assignments'
    ) THEN
        -- Add foreign key for assigned_to
        ALTER TABLE public.asset_assignments
        ADD CONSTRAINT asset_assignments_assigned_to_fkey
        FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Check if the assigned_by foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'asset_assignments_assigned_by_fkey'
        AND table_name = 'asset_assignments'
    ) THEN
        -- Add foreign key for assigned_by
        ALTER TABLE public.asset_assignments
        ADD CONSTRAINT asset_assignments_assigned_by_fkey
        FOREIGN KEY (assigned_by) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;

    -- Check if the asset_id foreign key exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'asset_assignments_asset_id_fkey'
        AND table_name = 'asset_assignments'
    ) THEN
        -- Add foreign key for asset_id
        ALTER TABLE public.asset_assignments
        ADD CONSTRAINT asset_assignments_asset_id_fkey
        FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;
    END IF;
END
$$; 