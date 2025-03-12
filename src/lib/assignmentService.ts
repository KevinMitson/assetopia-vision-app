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
    // First fetch the assignments
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('asset_assignments')
      .select('*')
      .eq('asset_id', assetId)
      .order('assignment_date', { ascending: false });
    
    if (assignmentError) {
      throw assignmentError;
    }
    
    if (!assignmentData || assignmentData.length === 0) {
      return { assignments: [], error: null };
    }
    
    // Get all unique user IDs from the assignments
    const userIds = [...new Set([
      ...assignmentData.map(a => a.assigned_to),
      ...assignmentData.map(a => a.assigned_by)
    ])];
    
    // Fetch user data for these IDs
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      // Continue with the assignments even if we can't get user data
    }
    
    // Create a map of user IDs to user data
    const userMap = new Map();
    if (userData) {
      userData.forEach(user => {
        userMap.set(user.id, user);
      });
    }
    
    // Enhance the assignments with user data
    const assignments = assignmentData.map(assignment => {
      const assignedToUser = userMap.get(assignment.assigned_to);
      const assignedByUser = userMap.get(assignment.assigned_by);
      
      return {
        ...assignment,
        assigned_to_user: assignedToUser,
        assigned_by_user: assignedByUser,
        assigned_to_name: assignedToUser?.full_name || 'Unknown',
        assigned_by_name: assignedByUser?.full_name || 'Unknown'
      };
    });
    
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
    // First fetch the active assignments
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('asset_assignments')
      .select('*')
      .eq('status', 'Active')
      .order('assignment_date', { ascending: false });
    
    if (assignmentError) {
      throw assignmentError;
    }
    
    if (!assignmentData || assignmentData.length === 0) {
      return { assignments: [], error: null };
    }
    
    // Get all unique user IDs and asset IDs from the assignments
    const userIds = [...new Set(assignmentData.map(a => a.assigned_to))];
    const assetIds = [...new Set(assignmentData.map(a => a.asset_id))];
    
    // Fetch user data for these IDs
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', userIds);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      // Continue with the assignments even if we can't get user data
    }
    
    // Fetch asset data for these IDs
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .select('id, asset_no, equipment')
      .in('id', assetIds);
    
    if (assetError) {
      console.error('Error fetching asset data:', assetError);
      // Continue with the assignments even if we can't get asset data
    }
    
    // Create maps of user IDs and asset IDs to their data
    const userMap = new Map();
    if (userData) {
      userData.forEach(user => {
        userMap.set(user.id, user);
      });
    }
    
    const assetMap = new Map();
    if (assetData) {
      assetData.forEach(asset => {
        assetMap.set(asset.id, asset);
      });
    }
    
    // Enhance the assignments with user and asset data
    const assignments = assignmentData.map(assignment => {
      const assignedToUser = userMap.get(assignment.assigned_to);
      const asset = assetMap.get(assignment.asset_id);
      
      return {
        ...assignment,
        assigned_to_user: assignedToUser,
        assigned_to_name: assignedToUser?.full_name || 'Unknown',
        assets: asset
      };
    });
    
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
    // First fetch the assignments for this user
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('asset_assignments')
      .select('*')
      .eq('assigned_to', userId)
      .order('assignment_date', { ascending: false });
    
    if (assignmentError) {
      throw assignmentError;
    }
    
    if (!assignmentData || assignmentData.length === 0) {
      return { assignments: [], error: null };
    }
    
    // Get all unique asset IDs from the assignments
    const assetIds = [...new Set(assignmentData.map(a => a.asset_id))];
    
    // Fetch asset data for these IDs
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .select('id, asset_no, equipment, department, station')
      .in('id', assetIds);
    
    if (assetError) {
      console.error('Error fetching asset data:', assetError);
      // Continue with the assignments even if we can't get asset data
    }
    
    // Create a map of asset IDs to asset data
    const assetMap = new Map();
    if (assetData) {
      assetData.forEach(asset => {
        assetMap.set(asset.id, asset);
      });
    }
    
    // Enhance the assignments with asset data
    const assignments = assignmentData.map(assignment => {
      const asset = assetMap.get(assignment.asset_id);
      
      return {
        ...assignment,
        assets: asset
      };
    });
    
    return { assignments, error: null };
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