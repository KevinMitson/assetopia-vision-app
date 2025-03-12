import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface AssetAssignment {
  id: string;
  asset_id: string;
  assigned_to: string;
  assigned_by: string;
  assignment_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  status: 'Active' | 'Returned' | 'Overdue' | 'Lost' | 'Damaged';
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all assignments for a specific asset
 */
export async function fetchAssetAssignments(assetId: string): Promise<{ data: AssetAssignment[] | null; error: Error | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('asset_assignments')
      .select('*, assigned_to:standalone_users!assigned_to(full_name), assigned_by:standalone_users!assigned_by(full_name)')
      .eq('asset_id', assetId)
      .order('assignment_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching asset assignments:', error);
    return { data: null, error };
  }
}

/**
 * Fetches all active assignments
 */
export async function fetchActiveAssignments(): Promise<{ data: AssetAssignment[] | null; error: Error | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('asset_assignments')
      .select('*, assigned_to:standalone_users!assigned_to(full_name), assets(asset_no, equipment)')
      .eq('status', 'Active')
      .order('assignment_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching active assignments:', error);
    return { data: null, error };
  }
}

/**
 * Fetches all assignments for a specific user
 */
export async function fetchUserAssignments(userId: string): Promise<{ data: AssetAssignment[] | null; error: Error | null }> {
  try {
    const { data, error } = await (supabase as any)
      .from('asset_assignments')
      .select('*, assets(asset_no, equipment, department, station)')
      .eq('assigned_to', userId)
      .order('assignment_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching user assignments:', error);
    return { data: null, error };
  }
}

/**
 * Assigns an asset to a user
 */
export async function assignAsset(assignment: {
  asset_id: string;
  assigned_to: string;
  assigned_by: string;
  assignment_date: string;
  expected_return_date?: string;
  notes?: string;
  status?: AssetAssignment['status'];
}): Promise<{ success: boolean; error: Error | null }> {
  try {
    // First check if the asset is already assigned
    const { data: existingAssignments } = await (supabase as any)
      .from('asset_assignments')
      .select('id')
      .eq('asset_id', assignment.asset_id)
      .eq('status', 'Active')
      .maybeSingle();
    
    if (existingAssignments) {
      throw new Error('Asset is already assigned to someone else');
    }
    
    // Create the new assignment
    const { error } = await (supabase as any)
      .from('asset_assignments')
      .insert({
        ...assignment,
        status: assignment.status || 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      throw error;
    }
    
    // Update the asset status to "Assigned"
    const { error: assetUpdateError } = await (supabase as any)
      .from('assets')
      .update({ status: 'Assigned' })
      .eq('id', assignment.asset_id);
    
    if (assetUpdateError) {
      console.error('Error updating asset status:', assetUpdateError);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error assigning asset:', error);
    return { success: false, error };
  }
}

/**
 * Returns an assigned asset
 */
export async function returnAsset(
  assignmentId: string,
  returnDate: string,
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get the assignment to find the asset_id
    const { data: assignment, error: fetchError } = await (supabase as any)
      .from('asset_assignments')
      .select('asset_id')
      .eq('id', assignmentId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Update the assignment
    const { error } = await (supabase as any)
      .from('asset_assignments')
      .update({
        status: 'Returned',
        actual_return_date: returnDate,
        notes: notes ? `${assignment.notes || ''}\n\nReturn notes: ${notes}` : assignment.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);
    
    if (error) {
      throw error;
    }
    
    // Update the asset status to "Available"
    const { error: assetUpdateError } = await (supabase as any)
      .from('assets')
      .update({ status: 'Available' })
      .eq('id', assignment.asset_id);
    
    if (assetUpdateError) {
      console.error('Error updating asset status:', assetUpdateError);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error returning asset:', error);
    return { success: false, error };
  }
}

/**
 * Updates an assignment status (e.g., mark as lost)
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: AssetAssignment['status'],
  notes?: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Get the assignment to find the asset_id and current notes
    const { data: assignment, error: fetchError } = await (supabase as any)
      .from('asset_assignments')
      .select('asset_id, notes')
      .eq('id', assignmentId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Update the assignment
    const { error } = await (supabase as any)
      .from('asset_assignments')
      .update({
        status,
        notes: notes ? `${assignment.notes || ''}\n\nStatus update notes: ${notes}` : assignment.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', assignmentId);
    
    if (error) {
      throw error;
    }
    
    // Update the asset status based on the assignment status
    let assetStatus = 'Available';
    if (status === 'Lost') {
      assetStatus = 'Lost';
    } else if (status === 'Active') {
      assetStatus = 'Assigned';
    } else if (status === 'Damaged') {
      assetStatus = 'Damaged';
    }
    
    const { error: assetUpdateError } = await (supabase as any)
      .from('assets')
      .update({ status: assetStatus })
      .eq('id', assignment.asset_id);
    
    if (assetUpdateError) {
      console.error('Error updating asset status:', assetUpdateError);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating assignment status:', error);
    return { success: false, error };
  }
} 