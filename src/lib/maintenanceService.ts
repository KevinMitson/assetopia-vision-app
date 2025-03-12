import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  
  // Equipment Information (auto-populated from asset)
  equipment_type?: string;
  make_model?: string;
  serial_number?: string;
  location?: string;
  department?: string;
  assigned_user?: string;
  
  // Maintenance Information
  maintenance_type: 'Scheduled' | 'Preventive' | 'Corrective' | 'Emergency';
  date_performed: string;
  technician_name: string;
  technician_id?: string;
  maintenance_interval?: 'Monthly' | 'Quarterly' | 'Bi-annually' | 'Annually' | 'As needed';
  
  // Hardware Inspection
  exterior_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  exterior_action?: 'Cleaned' | 'Repaired' | 'N/A';
  exterior_notes?: string;
  
  cooling_fans_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  cooling_fans_action?: 'Cleaned' | 'Replaced' | 'N/A';
  cooling_fans_notes?: string;
  
  power_supply_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  power_supply_action?: 'Tested' | 'Replaced' | 'N/A';
  power_supply_notes?: string;
  
  motherboard_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  motherboard_action?: 'Inspected' | 'Replaced' | 'N/A';
  motherboard_notes?: string;
  
  ram_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  ram_action?: 'Tested' | 'Upgraded' | 'N/A';
  ram_notes?: string;
  
  hard_drive_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  hard_drive_action?: 'Defragmented' | 'Replaced' | 'N/A';
  hard_drive_notes?: string;
  
  display_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  display_action?: 'Calibrated' | 'Replaced' | 'N/A';
  display_notes?: string;
  
  keyboard_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  keyboard_action?: 'Cleaned' | 'Replaced' | 'N/A';
  keyboard_notes?: string;
  
  mouse_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  mouse_action?: 'Cleaned' | 'Replaced' | 'N/A';
  mouse_notes?: string;
  
  ports_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  ports_action?: 'Cleaned' | 'Repaired' | 'N/A';
  ports_notes?: string;
  
  battery_condition?: 'Good' | 'Fair' | 'Poor' | 'N/A';
  battery_action?: 'Tested' | 'Replaced' | 'N/A';
  battery_notes?: string;
  
  // Software Maintenance
  os_updates?: boolean;
  os_updates_notes?: string;
  
  antivirus_updates?: boolean;
  antivirus_updates_notes?: string;
  
  application_updates?: boolean;
  application_updates_notes?: string;
  
  driver_updates?: boolean;
  driver_updates_notes?: string;
  
  disk_cleanup?: boolean;
  disk_cleanup_notes?: string;
  
  temp_files_removal?: boolean;
  temp_files_removal_notes?: string;
  
  error_log_review?: boolean;
  error_log_review_notes?: string;
  
  registry_cleanup?: boolean;
  registry_cleanup_notes?: string;
  
  backup_verification?: boolean;
  backup_verification_notes?: string;
  
  // Network Equipment
  firmware_updates?: boolean;
  firmware_updates_notes?: string;
  
  config_backup?: boolean;
  config_backup_notes?: string;
  
  port_check?: boolean;
  port_check_notes?: string;
  
  network_error_log?: boolean;
  network_error_log_notes?: string;
  
  performance_testing?: boolean;
  performance_testing_notes?: string;
  
  security_check?: boolean;
  security_check_notes?: string;
  
  // Printer Maintenance
  cartridge_check?: boolean;
  cartridge_check_notes?: string;
  
  print_head_cleaning?: boolean;
  print_head_cleaning_notes?: string;
  
  paper_path_cleaning?: boolean;
  paper_path_cleaning_notes?: string;
  
  test_print?: boolean;
  test_print_notes?: string;
  
  calibration?: boolean;
  calibration_notes?: string;
  
  // Performance Metrics
  boot_time_before?: string;
  boot_time_after?: string;
  
  memory_usage_before?: string;
  memory_usage_after?: string;
  
  disk_space_before?: string;
  disk_space_after?: string;
  
  cpu_temp_before?: string;
  cpu_temp_after?: string;
  
  network_speed_before?: string;
  network_speed_after?: string;
  
  // Issues and Summary
  issues_found?: boolean;
  issues_description?: string;
  
  parts_replaced?: string;
  software_updated?: string;
  time_spent?: number;
  followup_required?: boolean;
  next_maintenance_date?: string;
  
  // Additional Comments
  additional_comments?: string;
  
  // Sign-off
  technician_signature?: string;
  supervisor_id?: string;
  supervisor_signature?: string;
  supervisor_date?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
}

// Type for creating a new maintenance record with required fields
export type NewMaintenanceRecord = Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>;

// Type for updating a maintenance record
export type MaintenanceRecordUpdate = Partial<Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>>;

/**
 * Fetch all maintenance records for a specific asset
 */
export async function fetchAssetMaintenanceRecords(assetId: string) {
  try {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('asset_id', assetId)
      .order('date_performed', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { records: data as MaintenanceRecord[], error: null };
  } catch (err: any) {
    console.error('Error fetching maintenance records:', err);
    return { records: [], error: err.message };
  }
}

/**
 * Fetch all upcoming maintenance records
 */
export async function fetchUpcomingMaintenance() {
  try {
    const today = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .gte('next_maintenance_date', today)
      .order('next_maintenance_date', { ascending: true });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { records: data as MaintenanceRecord[], error: null };
  } catch (err: any) {
    console.error('Error fetching upcoming maintenance:', err);
    return { records: [], error: err.message };
  }
}

/**
 * Fetch maintenance records by various filters
 */
export async function fetchMaintenanceRecords({
  assetId,
  technicianId,
  maintenanceType,
  startDate,
  endDate,
  searchQuery,
  limit = 100,
  offset = 0
}: {
  assetId?: string;
  technicianId?: string;
  maintenanceType?: MaintenanceRecord['maintenance_type'];
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase
      .from('maintenance_records')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (assetId) {
      query = query.eq('asset_id', assetId);
    }
    
    if (technicianId) {
      query = query.eq('technician_id', technicianId);
    }
    
    if (maintenanceType) {
      query = query.eq('maintenance_type', maintenanceType);
    }
    
    if (startDate) {
      query = query.gte('date_performed', startDate);
    }
    
    if (endDate) {
      query = query.lte('date_performed', endDate);
    }
    
    // Apply text search if provided
    if (searchQuery && searchQuery.trim() !== '') {
      query = query.or(`
        technician_name.ilike.%${searchQuery}%,
        additional_comments.ilike.%${searchQuery}%,
        parts_replaced.ilike.%${searchQuery}%,
        software_updated.ilike.%${searchQuery}%
      `);
    }
    
    // Apply pagination
    query = query
      .order('date_performed', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw new Error(error.message);
    }
    
    return { 
      records: data as MaintenanceRecord[], 
      count: count || 0,
      error: null 
    };
  } catch (err: any) {
    console.error('Error fetching maintenance records:', err);
    return { records: [], count: 0, error: err.message };
  }
}

/**
 * Add a new maintenance record
 */
export async function addMaintenanceRecord(record: NewMaintenanceRecord) {
  try {
    console.log("Adding maintenance record:", record);
    
    // Ensure required fields are present
    if (!record.asset_id) {
      throw new Error("Asset ID is required");
    }
    
    if (!record.maintenance_type) {
      throw new Error("Maintenance type is required");
    }
    
    if (!record.date_performed) {
      throw new Error("Date performed is required");
    }
    
    if (!record.technician_name) {
      throw new Error("Technician name is required");
    }
    
    // Check if the asset exists
    const { data: assetExists, error: assetCheckError } = await supabase
      .from('assets')
      .select('id')
      .eq('id', record.asset_id)
      .single();
    
    if (assetCheckError) {
      console.error("Error checking asset:", assetCheckError);
      throw new Error(`Asset not found: ${assetCheckError.message}`);
    }
    
    // Insert the record
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(record)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error adding maintenance record:", error);
      throw new Error(error.message);
    }
    
    console.log("Maintenance record added successfully:", data);
    
    // Update the asset's last_maintenance_date and next_maintenance_date
    if (record.next_maintenance_date) {
      const { error: updateError } = await supabase
        .from('assets')
        .update({
          last_maintenance_date: record.date_performed,
          next_maintenance_date: record.next_maintenance_date
        })
        .eq('id', record.asset_id);
      
      if (updateError) {
        console.warn("Error updating asset maintenance dates:", updateError);
        // Don't throw here, as the record was already created
      }
    }
    
    return { record: data as MaintenanceRecord, error: null };
  } catch (err: any) {
    console.error('Error adding maintenance record:', err);
    return { record: null, error: err.message };
  }
}

/**
 * Update an existing maintenance record
 */
export async function updateMaintenanceRecord(id: string, updates: MaintenanceRecordUpdate) {
  try {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Update the asset's next_maintenance_date if it changed
    if (updates.next_maintenance_date) {
      await supabase
        .from('assets')
        .update({
          next_maintenance_date: updates.next_maintenance_date
        })
        .eq('id', data.asset_id);
    }
    
    return { record: data as MaintenanceRecord, error: null };
  } catch (err: any) {
    console.error('Error updating maintenance record:', err);
    return { record: null, error: err.message };
  }
}

/**
 * Delete a maintenance record
 */
export async function deleteMaintenanceRecord(id: string) {
  try {
    // First get the record to know the asset_id
    const { data: record } = await supabase
      .from('maintenance_records')
      .select('asset_id')
      .eq('id', id)
      .single();
    
    // Delete the record
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
    
    // If this was the latest maintenance record, update the asset's next_maintenance_date
    if (record) {
      const { data: latestRecord } = await supabase
        .from('maintenance_records')
        .select('next_maintenance_date')
        .eq('asset_id', record.asset_id)
        .order('date_performed', { ascending: false })
        .limit(1)
        .single();
      
      if (latestRecord) {
        await supabase
          .from('assets')
          .update({
            next_maintenance_date: latestRecord.next_maintenance_date
          })
          .eq('id', record.asset_id);
      }
    }
    
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error deleting maintenance record:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch asset details by serial number, asset tag, or assigned user
 * Used for auto-populating the maintenance form
 */
export async function fetchAssetByIdentifier(identifier: string) {
  try {
    // Try to find by serial number first
    let { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        profiles:assigned_to (id, full_name, email)
      `)
      .eq('serial_number', identifier)
      .single();
    
    if (error || !data) {
      // Try to find by asset tag
      ({ data, error } = await supabase
        .from('assets')
        .select(`
          *,
          profiles:assigned_to (id, full_name, email)
        `)
        .eq('asset_tag', identifier)
        .single());
    }
    
    if (error || !data) {
      // Try to find by user (will return multiple assets potentially)
      ({ data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name,
          email,
          assets:assets (*)
        `)
        .or(`full_name.ilike.%${identifier}%,email.ilike.%${identifier}%`)
        .single());
      
      if (!error && data && data.assets && data.assets.length > 0) {
        // Return the first asset assigned to this user
        return { 
          asset: {
            ...data.assets[0],
            assigned_user: {
              id: data.id,
              full_name: data.full_name,
              email: data.email
            }
          }, 
          error: null 
        };
      }
    }
    
    if (error) {
      throw new Error('Asset not found with the provided identifier');
    }
    
    return { asset: data, error: null };
  } catch (err: any) {
    console.error('Error fetching asset by identifier:', err);
    return { asset: null, error: err.message };
  }
}

/**
 * Generate a maintenance report for export
 */
export async function generateMaintenanceReport({
  assetId,
  startDate,
  endDate,
  maintenanceType,
  technicianId
}: {
  assetId?: string;
  startDate?: string;
  endDate?: string;
  maintenanceType?: MaintenanceRecord['maintenance_type'];
  technicianId?: string;
}) {
  try {
    const { records, error } = await fetchMaintenanceRecords({
      assetId,
      technicianId,
      maintenanceType,
      startDate,
      endDate,
      limit: 1000 // Get a large number for the report
    });
    
    if (error) {
      throw new Error(error);
    }
    
    // Get asset details for all assets in the report
    const assetIds = [...new Set(records.map(record => record.asset_id))];
    
    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .in('id', assetIds);
    
    if (assetsError) {
      throw new Error(assetsError.message);
    }
    
    // Get technician details
    const technicianIds = [...new Set(records
      .filter(record => record.technician_id)
      .map(record => record.technician_id as string))];
    
    const { data: technicians, error: techniciansError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', technicianIds);
    
    if (techniciansError) {
      throw new Error(techniciansError.message);
    }
    
    // Create a lookup map for assets and technicians
    const assetMap = assets.reduce((map, asset) => {
      map[asset.id] = asset;
      return map;
    }, {} as Record<string, any>);
    
    const technicianMap = technicians.reduce((map, tech) => {
      map[tech.id] = tech;
      return map;
    }, {} as Record<string, any>);
    
    // Enhance records with asset and technician details
    const enhancedRecords = records.map(record => ({
      ...record,
      asset: assetMap[record.asset_id],
      technician: record.technician_id ? technicianMap[record.technician_id] : null
    }));
    
    return { 
      records: enhancedRecords,
      error: null 
    };
  } catch (err: any) {
    console.error('Error generating maintenance report:', err);
    return { records: [], error: err.message };
  }
} 