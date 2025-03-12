import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

export interface User {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  station?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetches all users from both standalone_users and user_roles tables
 */
export async function fetchAllUsers() {
  try {
    console.log('Fetching users...');
    
    // Fetch standalone users
    const { data: standaloneUsers, error: standaloneError } = await (supabase as any)
      .from('standalone_users')
      .select('*')
      .order('full_name');

    if (standaloneError) {
      console.error('Error fetching standalone users:', standaloneError);
      throw standaloneError;
    }

    console.log('Standalone users fetched:', standaloneUsers?.length || 0);

    // Fetch users from user_roles with a safer join
    const { data: roleUsers, error: roleError } = await (supabase as any)
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        users:auth.users!user_id (
          id,
          email
        )
      `)
      .order('user_id');

    if (roleError) {
      console.error('Error fetching role users:', roleError);
      // Don't throw here, just log and continue with standalone users
      return { users: standaloneUsers || [], error: null };
    }

    console.log('Role users fetched:', roleUsers?.length || 0);

    if (!roleUsers || roleUsers.length === 0) {
      // If no role users found, just return standalone users
      return { users: standaloneUsers || [], error: null };
    }

    // Transform role users to match the User interface
    const transformedRoleUsers = roleUsers
      .filter(ru => ru.users) // Filter out any null users
      .map(ru => ({
        id: ru.user_id,
        full_name: ru.users.email?.split('@')[0] || ru.user_id, // Use email username or ID if no name
        email: ru.users.email,
        role_id: ru.role_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

    console.log('Transformed role users:', transformedRoleUsers.length);

    // Merge both sets of users, avoiding duplicates by ID
    const userMap = new Map();
    
    // Add standalone users first
    if (standaloneUsers) {
      standaloneUsers.forEach(user => {
        userMap.set(user.id, user);
      });
    }

    // Add role users, but don't overwrite existing standalone users
    transformedRoleUsers.forEach(user => {
      if (!userMap.has(user.id)) {
        userMap.set(user.id, user);
      }
    });

    // Convert map back to array
    const allUsers = Array.from(userMap.values());
    console.log('Total users after merge:', allUsers.length);

    return { users: allUsers as User[], error: null };
  } catch (error: any) {
    console.error('Error in fetchAllUsers:', error);
    // Return an empty array instead of throwing
    return { users: [], error: error.message };
  }
}

/**
 * Checks if a user exists in either standalone_users or user_roles tables
 */
export async function checkUserExists(fullName: string) {
  try {
    // Check standalone_users first
    const { data: standaloneUser, error: standaloneError } = await (supabase as any)
      .from('standalone_users')
      .select('id')
      .eq('full_name', fullName)
      .maybeSingle();

    if (standaloneError) {
      throw standaloneError;
    }

    if (standaloneUser) {
      return { exists: true, userId: standaloneUser.id, error: null };
    }

    // Check user_roles table if not found in standalone_users
    const { data: roleUser, error: roleError } = await (supabase as any)
      .from('user_roles')
      .select('user_id, users!inner(full_name)')
      .eq('users.full_name', fullName)
      .maybeSingle();

    if (roleError) {
      throw roleError;
    }

    return { 
      exists: !!roleUser, 
      userId: roleUser?.user_id || null, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error checking if user exists:', error);
    return { exists: false, userId: null, error: error.message };
  }
}

/**
 * Adds a new user to the standalone_users table and optionally to user_roles
 */
export async function addUser(userData: {
  full_name: string;
  email?: string;
  department?: string;
  designation?: string;
  station?: string;
  role_id?: string; // Optional role ID for user_roles table
}) {
  try {
    // Check if user already exists in either table
    const { exists, userId, error: checkError } = await checkUserExists(userData.full_name);
    
    if (checkError) {
      throw new Error(checkError);
    }
    
    if (exists) {
      throw new Error(`User "${userData.full_name}" already exists`);
    }
    
    // Start a Supabase transaction
    const { data, error } = await (supabase as any)
      .from('standalone_users')
      .insert({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    // If a role_id is provided, also add to user_roles table
    if (userData.role_id && data.id) {
      const { error: roleError } = await (supabase as any)
        .from('user_roles')
        .insert({
          user_id: data.id,
          role_id: userData.role_id
        });

      if (roleError) {
        // If role assignment fails, we should still return success for the user creation
        console.error('Error assigning role to user:', roleError);
      }
    }
    
    return { success: true, user: data as User, error: null };
  } catch (error: any) {
    console.error('Error adding user:', error);
    return { success: false, user: null, error: error.message };
  }
}

/**
 * Updates an existing user in the standalone_users table
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    const { data, error } = await (supabase as any)
      .from('standalone_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { success: true, user: data as User, error: null };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, user: null, error: error.message };
  }
}

/**
 * Imports multiple users, updating existing ones and adding new ones
 */
export async function importUsers(fileData: ArrayBuffer) {
  try {
    const workbook = XLSX.read(fileData, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    if (!data || data.length === 0) {
      throw new Error('No data found in the imported file');
    }
    
    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: [] as { row: number; name: string; error: string }[]
    };
    
    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any;
      
      // Validate required fields
      if (!row.full_name) {
        results.failed++;
        results.errors.push({
          row: i + 2, // +2 because Excel is 1-indexed and we have a header row
          name: row.full_name || 'Unknown',
          error: 'Missing full name'
        });
        continue;
      }
      
      try {
        // Check if user exists
        const { exists, userId } = await checkUserExists(row.full_name);
        
        if (exists && userId) {
          // Update existing user
          const { success, error } = await updateUser(userId, {
            email: row.email,
            department: row.department,
            designation: row.designation,
            station: row.station
          });
          
          if (!success) {
            throw new Error(error || 'Failed to update user');
          }
          
          results.successful++;
        } else {
          // Add new user
          const { success, error } = await addUser({
            full_name: row.full_name,
            email: row.email,
            department: row.department,
            designation: row.designation,
            station: row.station
          });
          
          if (!success) {
            throw new Error(error || 'Failed to add user');
          }
          
          results.successful++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          row: i + 2,
          name: row.full_name || 'Unknown',
          error: error.message
        });
      }
    }
    
    return { success: true, results, error: null };
  } catch (error: any) {
    console.error('Error importing users:', error);
    return { 
      success: false, 
      results: null, 
      error: error.message 
    };
  }
} 