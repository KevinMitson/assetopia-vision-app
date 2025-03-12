-- Drop existing tables if they exist (comment out if you want to preserve existing data)
-- DROP TABLE IF EXISTS maintenance_records;

-- Create enhanced maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    
    -- Equipment Information (auto-populated from asset)
    equipment_type VARCHAR(50),
    make_model VARCHAR(100),
    serial_number VARCHAR(100),
    location VARCHAR(100),
    department VARCHAR(100),
    assigned_user UUID REFERENCES profiles(id),
    
    -- Maintenance Information
    maintenance_type VARCHAR(20) NOT NULL CHECK (maintenance_type IN ('Scheduled', 'Preventive', 'Corrective', 'Emergency')),
    date_performed TIMESTAMP WITH TIME ZONE NOT NULL,
    technician_name VARCHAR(100) NOT NULL,
    technician_id UUID REFERENCES profiles(id),
    maintenance_interval VARCHAR(20) CHECK (maintenance_interval IN ('Monthly', 'Quarterly', 'Bi-annually', 'Annually', 'As needed')),
    
    -- Hardware Inspection
    exterior_condition VARCHAR(20) CHECK (exterior_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    exterior_action VARCHAR(20) CHECK (exterior_action IN ('Cleaned', 'Repaired', 'N/A')),
    exterior_notes TEXT,
    
    cooling_fans_condition VARCHAR(20) CHECK (cooling_fans_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    cooling_fans_action VARCHAR(20) CHECK (cooling_fans_action IN ('Cleaned', 'Replaced', 'N/A')),
    cooling_fans_notes TEXT,
    
    power_supply_condition VARCHAR(20) CHECK (power_supply_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    power_supply_action VARCHAR(20) CHECK (power_supply_action IN ('Tested', 'Replaced', 'N/A')),
    power_supply_notes TEXT,
    
    motherboard_condition VARCHAR(20) CHECK (motherboard_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    motherboard_action VARCHAR(20) CHECK (motherboard_action IN ('Inspected', 'Replaced', 'N/A')),
    motherboard_notes TEXT,
    
    ram_condition VARCHAR(20) CHECK (ram_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    ram_action VARCHAR(20) CHECK (ram_action IN ('Tested', 'Upgraded', 'N/A')),
    ram_notes TEXT,
    
    hard_drive_condition VARCHAR(20) CHECK (hard_drive_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    hard_drive_action VARCHAR(20) CHECK (hard_drive_action IN ('Defragmented', 'Replaced', 'N/A')),
    hard_drive_notes TEXT,
    
    display_condition VARCHAR(20) CHECK (display_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    display_action VARCHAR(20) CHECK (display_action IN ('Calibrated', 'Replaced', 'N/A')),
    display_notes TEXT,
    
    keyboard_condition VARCHAR(20) CHECK (keyboard_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    keyboard_action VARCHAR(20) CHECK (keyboard_action IN ('Cleaned', 'Replaced', 'N/A')),
    keyboard_notes TEXT,
    
    mouse_condition VARCHAR(20) CHECK (mouse_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    mouse_action VARCHAR(20) CHECK (mouse_action IN ('Cleaned', 'Replaced', 'N/A')),
    mouse_notes TEXT,
    
    ports_condition VARCHAR(20) CHECK (ports_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    ports_action VARCHAR(20) CHECK (ports_action IN ('Cleaned', 'Repaired', 'N/A')),
    ports_notes TEXT,
    
    battery_condition VARCHAR(20) CHECK (battery_condition IN ('Good', 'Fair', 'Poor', 'N/A')),
    battery_action VARCHAR(20) CHECK (battery_action IN ('Tested', 'Replaced', 'N/A')),
    battery_notes TEXT,
    
    -- Software Maintenance
    os_updates BOOLEAN,
    os_updates_notes TEXT,
    
    antivirus_updates BOOLEAN,
    antivirus_updates_notes TEXT,
    
    application_updates BOOLEAN,
    application_updates_notes TEXT,
    
    driver_updates BOOLEAN,
    driver_updates_notes TEXT,
    
    disk_cleanup BOOLEAN,
    disk_cleanup_notes TEXT,
    
    temp_files_removal BOOLEAN,
    temp_files_removal_notes TEXT,
    
    error_log_review BOOLEAN,
    error_log_review_notes TEXT,
    
    registry_cleanup BOOLEAN,
    registry_cleanup_notes TEXT,
    
    backup_verification BOOLEAN,
    backup_verification_notes TEXT,
    
    -- Network Equipment
    firmware_updates BOOLEAN,
    firmware_updates_notes TEXT,
    
    config_backup BOOLEAN,
    config_backup_notes TEXT,
    
    port_check BOOLEAN,
    port_check_notes TEXT,
    
    network_error_log BOOLEAN,
    network_error_log_notes TEXT,
    
    performance_testing BOOLEAN,
    performance_testing_notes TEXT,
    
    security_check BOOLEAN,
    security_check_notes TEXT,
    
    -- Printer Maintenance
    cartridge_check BOOLEAN,
    cartridge_check_notes TEXT,
    
    print_head_cleaning BOOLEAN,
    print_head_cleaning_notes TEXT,
    
    paper_path_cleaning BOOLEAN,
    paper_path_cleaning_notes TEXT,
    
    test_print BOOLEAN,
    test_print_notes TEXT,
    
    calibration BOOLEAN,
    calibration_notes TEXT,
    
    -- Performance Metrics
    boot_time_before VARCHAR(50),
    boot_time_after VARCHAR(50),
    
    memory_usage_before VARCHAR(50),
    memory_usage_after VARCHAR(50),
    
    disk_space_before VARCHAR(50),
    disk_space_after VARCHAR(50),
    
    cpu_temp_before VARCHAR(50),
    cpu_temp_after VARCHAR(50),
    
    network_speed_before VARCHAR(50),
    network_speed_after VARCHAR(50),
    
    -- Issues and Summary
    issues_found BOOLEAN DEFAULT FALSE,
    issues_description TEXT,
    
    parts_replaced TEXT,
    software_updated TEXT,
    time_spent DECIMAL(5,2),
    followup_required BOOLEAN DEFAULT FALSE,
    next_maintenance_date TIMESTAMP WITH TIME ZONE,
    
    -- Additional Comments
    additional_comments TEXT,
    
    -- Sign-off
    technician_signature TEXT,
    supervisor_id UUID REFERENCES profiles(id),
    supervisor_signature TEXT,
    supervisor_date TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON maintenance_records(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_records(date_performed);
CREATE INDEX IF NOT EXISTS idx_maintenance_next_date ON maintenance_records(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_technician ON maintenance_records(technician_id);

-- Create asset_assignments table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS asset_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES assets(id),
    assigned_to UUID NOT NULL REFERENCES profiles(id),
    assigned_by UUID NOT NULL REFERENCES profiles(id),
    assignment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expected_return_date TIMESTAMP WITH TIME ZONE,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Overdue', 'Returned', 'Lost', 'Damaged')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_assignment_asset_id ON asset_assignments(asset_id);
CREATE INDEX IF NOT EXISTS idx_assignment_assigned_to ON asset_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_assignment_status ON asset_assignments(status); 