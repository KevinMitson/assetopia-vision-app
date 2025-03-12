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
  // New fields from joins
  assigned_to_user?: { id: string; full_name: string; email?: string };
  assigned_by_user?: { id: string; full_name: string; email?: string };
  assigned_to_name?: string;
  assigned_by_name?: string;
  assets?: any;
}

/**
 * Fetches all assignments for a specific asset
 */
export async function fetchAssetAssignments(assetId: string) {
  try {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        assigned_to_user:users!assigned_to(id, full_name, email),
        assigned_by_user:users!assigned_by(id, full_name, email)
      `)
      .eq('asset_id', assetId)
      .order('assignment_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match the expected format
    const assignments = data.map(assignment => ({
      ...assignment,
      assigned_to_name: assignment.assigned_to_user?.full_name || 'Unknown',
      assigned_by_name: assignment.assigned_by_user?.full_name || 'Unknown'
    }));
    
    return { assignments, error: null };
  } catch (error: any) {
    console.error('Error fetching asset assignments:', error);
    return { assignments: [], error: error.message };
  }
}

/**
 * Fetches all active assignments
 */
export async function fetchActiveAssignments() {
  try {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        assigned_to_user:users!assigned_to(id, full_name, email),
        assets(id, asset_no, equipment)
      `)
      .eq('status', 'Active')
      .order('assignment_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match the expected format
    const assignments = data.map(assignment => ({
      ...assignment,
      assigned_to_name: assignment.assigned_to_user?.full_name || 'Unknown'
    }));
    
    return { assignments, error: null };
  } catch (error: any) {
    console.error('Error fetching active assignments:', error);
    return { assignments: [], error: error.message };
  }
}

/**
 * Fetches all assignments for a specific user
 */
export async function fetchUserAssignments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('asset_assignments')
      .select(`
        *,
        assets(id, asset_no, equipment, department, station)
      `)
      .eq('assigned_to', userId)
      .order('assignment_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { assignments: data, error: null };
  } catch (error: any) {
    console.error('Error fetching user assignments:', error);
    return { assignments: [], error: error.message };
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
}) {
  try {
    // First check if the asset is already assigned
    const { data: existingAssignments, error: checkError } = await supabase
      .from('asset_assignments')
      .select('id')
      .eq('asset_id', assignment.asset_id)
      .eq('status', 'Active')
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing assignments:', checkError);
    }
    
    if (existingAssignments) {
      throw new Error('Asset is already assigned to someone else');
    }
    
    // Verify that the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', assignment.assigned_to)
      .maybeSingle();
      
    if (userError) {
      console.error('Error checking user:', userError);
      throw new Error('Error verifying user');
    }
    
    if (!user) {
      throw new Error('User not found. Please select a valid user.');
    }
    
    // Create the new assignment
    const { data, error } = await supabase
      .from('asset_assignments')
      .insert({
        ...assignment,
        status: assignment.status || 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Update the asset status to "Assigned"
    const { error: assetUpdateError } = await supabase
      .from('assets')
      .update({ 
        status: 'Assigned',
        user_id: assignment.assigned_to
      })
      .eq('id', assignment.asset_id);
    
    if (assetUpdateError) {
      console.error('Error updating asset status:', assetUpdateError);
    }
    
    return { success: true, assignment: data, error: null };
  } catch (error: any) {
    console.error('Error assigning asset:', error);
    return { success: false, assignment: null, error: error.message };
  }
}

/**
 * Returns an assigned asset
 */
export async function returnAsset(
  assignmentId: string,
  returnDate: string,
  notes?: string
) {
  try {
    // Get the assignment to find the asset_id
    const { data: assignment, error: fetchError } = await supabase
      .from('asset_assignments')
      .select('asset_id, notes')
      .eq('id', assignmentId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Update the assignment
    const { error } = await supabase
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
    const { error: assetUpdateError } = await supabase
      .from('assets')
      .update({ 
        status: 'Available',
        user_id: null
      })
      .eq('id', assignment.asset_id);
    
    if (assetUpdateError) {
      console.error('Error updating asset status:', assetUpdateError);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error returning asset:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Updates an assignment status (e.g., mark as lost)
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: AssetAssignment['status'],
  notes?: string
) {
  try {
    // Get the assignment to find the asset_id and current notes
    const { data: assignment, error: fetchError } = await supabase
      .from('asset_assignments')
      .select('asset_id, notes')
      .eq('id', assignmentId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Update the assignment
    const { error } = await supabase
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
    let userId = null;
    
    if (status === 'Lost') {
      assetStatus = 'Lost';
    } else if (status === 'Active') {
      assetStatus = 'Assigned';
      // Get the user ID from the assignment
      const { data: fullAssignment } = await supabase
        .from('asset_assignments')
        .select('assigned_to')
        .eq('id', assignmentId)
        .single();
        
      if (fullAssignment) {
        userId = fullAssignment.assigned_to;
      }
    } else if (status === 'Damaged') {
      assetStatus = 'Damaged';
    }
    
    const { error: assetUpdateError } = await supabase
      .from('assets')
      .update({ 
        status: assetStatus,
        user_id: userId
      })
      .eq('id', assignment.asset_id);
    
    if (assetUpdateError) {
      console.error('Error updating asset status:', assetUpdateError);
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error updating assignment status:', error);
    return { success: false, error: error.message };
  }
} 