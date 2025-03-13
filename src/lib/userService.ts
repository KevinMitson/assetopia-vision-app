import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { User } from '@/types';

/**
 * Fetches all users from the user_roles table
 */
export async function fetchAllUsers() {
  try {
    console.log('Fetching users...');
    
    // Fetch all users with their roles in a single query
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_roles (
          role_id,
          roles (
            name
          )
        )
      `);

    if (userError) {
      console.error('Error fetching users:', userError);
      throw userError;
    }

    console.log('Successfully fetched users:', userData?.length || 0);

    if (!userData || userData.length === 0) {
      return { users: [], error: null };
    }

    // Transform the data into the expected format
    const enhancedUsers = userData.map(user => ({
      id: user.id,
      full_name: user.full_name || `User ${user.id.substring(0, 8)}`,
      email: user.email,
      department: user.department,
      station: user.station,
      designation: user.designation,
      role_id: user.user_roles?.[0]?.role_id,
      role_name: user.user_roles?.[0]?.roles?.name || 'User',
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    console.log('Successfully transformed users:', enhancedUsers.length);
    
    // Debug: Log the first user
    if (enhancedUsers.length > 0) {
      console.log('First user:', enhancedUsers[0]);
    }

    return { users: enhancedUsers, error: null };
  } catch (error: any) {
    console.error('Error in fetchAllUsers:', error);
    return { users: [], error: error.message };
  }
}

/**
 * Checks if a user exists in the user_roles table
 */
export async function checkUserExists(email: string) {
  try {
    // Check if user exists in public users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('Error checking users table:', userError);
      return { exists: false, userId: null, error: null };
    }

    if (!user) {
      return { exists: false, userId: null, error: null };
    }

    // Check if user exists in user_roles
    const { data: roleUser, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError) {
      console.error('Error checking user_roles:', roleError);
      return { exists: false, userId: user.id, error: null };
    }

    return { 
      exists: !!roleUser, 
      userId: user.id, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error checking if user exists:', error);
    return { exists: false, userId: null, error: error.message };
  }
}

/**
 * Adds a new user to the users and user_roles tables
 */
export async function addUser(userData: {
  full_name: string;
  email: string;
  department?: string;
  designation?: string;
  station?: string;
  role_id?: string;
}) {
  try {
    if (!userData.email) {
      throw new Error('Email is required');
    }

    // Check if user already exists
    const { exists, userId, error: checkError } = await checkUserExists(userData.email);
    
    if (checkError) {
      throw new Error(checkError);
    }
    
    let authUserId = userId;
    
    // If user doesn't exist, create them in the users table
    if (!authUserId) {
      try {
        // Generate a UUID for the user - this ensures we have a valid ID before inserting
        const newUserId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15);
        
        // Direct insert with the generated ID to ensure it's not null
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            email: userData.email,
            full_name: userData.full_name,
            department: userData.department,
            station: userData.station,
            designation: userData.designation
          })
          .select('id')
          .single();
          
        if (insertError) {
          console.error('Error creating user:', insertError);
          
          // Only try RPC as fallback if the direct insert failed for a reason other than duplicates
          if (insertError.code !== '23505') {
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_user', {
              p_email: userData.email,
              p_full_name: userData.full_name,
              p_department: userData.department || null,
              p_station: userData.station || null,
              p_designation: userData.designation || null
            });
            
            if (rpcError) {
              console.error('Error using RPC to create user:', rpcError);
              throw rpcError;
            } else {
              authUserId = rpcData;
            }
          } else {
            throw insertError;
          }
        } else {
          authUserId = insertData.id;
        }
      } catch (e) {
        console.error('Error creating user:', e);
        throw new Error('Failed to create user: ' + (e as Error).message);
      }
    }
    
    if (!authUserId) {
      throw new Error('Failed to create or find user');
    }
    
    // Get default role if none provided
    let roleId = userData.role_id;
    if (!roleId) {
      const { data: defaultRole, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'User')
        .maybeSingle();
        
      if (roleError) {
        console.error('Error fetching default role:', roleError);
        
        // Try to create roles table if it doesn't exist
        await supabase.rpc('create_roles_if_not_exists');
        
        // Try again
        const { data: retryRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'User')
          .maybeSingle();
          
        roleId = retryRole?.id;
      } else {
        roleId = defaultRole?.id;
      }
      
      if (!roleId) {
        // Get any role if 'User' role doesn't exist
        const { data: anyRole } = await supabase
          .from('roles')
          .select('id')
          .limit(1)
          .single();
          
        roleId = anyRole?.id;
        
        // If still no role, create one
        if (!roleId) {
          const { data: newRole, error: newRoleError } = await supabase
            .from('roles')
            .insert({ name: 'User', description: 'Regular user with limited access' })
            .select('id')
            .single();
            
          if (newRoleError) {
            throw newRoleError;
          }
          
          roleId = newRole.id;
        }
      }
    }
    
    if (!roleId) {
      throw new Error('No role available to assign to user');
    }
    
    // Verify the user exists before adding the role
    const { data: userExists, error: userExistsError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUserId)
      .single();
    
    if (userExistsError) {
      throw new Error(`User does not exist in the database: ${userExistsError.message}`);
    }
    
    // Add user to user_roles
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUserId,
        role_id: roleId
      })
      .select()
      .single();
    
    if (error) {
      // Check if it's a unique constraint violation (user already has this role)
      if (error.code === '23505') {
        console.log('User already has this role, continuing...');
      } else {
        throw error;
      }
    }
    
    // Return the complete user data
    return { 
      success: true, 
      user: {
        id: authUserId,
        full_name: userData.full_name,
        email: userData.email,
        department: userData.department,
        designation: userData.designation,
        station: userData.station,
        role_id: roleId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error adding user:', error);
    return { success: false, user: null, error: error.message };
  }
}

/**
 * Updates an existing user in the users table
 */
export const updateUser = async (userId: string, userData: Partial<User>) => {
  try {
    // First update the user details
    const { error: userError } = await supabase
      .from('users')
      .update({
        full_name: userData.full_name,
        department: userData.department,
        station: userData.station,
        designation: userData.designation,
      })
      .eq('id', userId);

    if (userError) throw userError;

    // If role_id is provided, update the user's role
    if (userData.role_id) {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then insert new role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: userData.role_id
        });

      if (roleError) throw roleError;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
};

/**
 * Import multiple users from a CSV or Excel file
 */
export async function importUsers(users: any[]) {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each user
    for (const userData of users) {
      try {
        if (!userData.full_name) {
          results.failed++;
          results.errors.push(`Missing full_name for a user`);
          continue;
        }

        // Generate email if not provided
        if (!userData.email) {
          userData.email = `${userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@placeholder.local`;
        }

        // Check if we can use transactions
        let canUseTransactions = false;
        try {
          // Check if transaction functions are available
          const { error: testError } = await supabase.rpc('check_transaction_support', {});
          canUseTransactions = !testError;
        } catch (e) {
          canUseTransactions = false;
        }

        // Use transactions to ensure data consistency if supported
        if (canUseTransactions) {
          try {
            console.log(`Starting transaction for user: ${userData.full_name}`);
            await supabase.rpc('begin_transaction');
            
            // Add the user with transaction support
            const { success, error } = await addUser(userData);
            
            if (success) {
              await supabase.rpc('commit_transaction');
              results.success++;
            } else {
              await supabase.rpc('rollback_transaction');
              results.failed++;
              results.errors.push(`Failed to import ${userData.full_name}: ${error}`);
            }
          } catch (txError) {
            // If transaction functions fail, we'll try without them
            try {
              await supabase.rpc('rollback_transaction');
            } catch (rollbackError) {
              console.error('Error rolling back transaction:', rollbackError);
            }
            
            // Fall back to non-transactional approach
            const { success, error } = await addUser(userData);
            
            if (success) {
              results.success++;
            } else {
              results.failed++;
              results.errors.push(`Failed to import ${userData.full_name}: ${error}`);
            }
          }
        } else {
          // Simple approach without transaction support
          const { success, error } = await addUser(userData);

          if (success) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`Failed to import ${userData.full_name}: ${error}`);
          }
        }
      } catch (userError: any) {
        results.failed++;
        results.errors.push(`Error processing ${userData.full_name || 'unknown user'}: ${userError.message}`);
        console.error(`Error processing user import:`, userError);
      }
    }

    return results;
  } catch (error: any) {
    console.error('Error in bulk user import:', error);
    return {
      success: 0,
      failed: users.length,
      errors: [`Bulk import failed: ${error.message}`]
    };
  }
}

/**
 * Debug function to directly check user data from Supabase
 */
export async function debugUserData() {
  try {
    console.log('DEBUG: Checking user roles data...');
    
    // Check user_roles table with joins
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        roles (
          id,
          name
        ),
        users!inner (
          id,
          email,
          full_name,
          department,
          station,
          designation
        )
      `)
      .limit(5);
      
    if (userRolesError) {
      console.error('DEBUG: Error fetching user_roles:', userRolesError);
    } else {
      console.log('DEBUG: User roles data:', userRoles);
    }
    
    // Check roles table
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*');
      
    if (rolesError) {
      console.error('DEBUG: Error fetching roles:', rolesError);
    } else {
      console.log('DEBUG: Roles data:', roles);
    }
    
    return { success: true };
  } catch (error) {
    console.error('DEBUG: Error in debugUserData:', error);
    return { success: false, error };
  }
}

/**
 * Deletes a user from the system
 */
export async function deleteUser(userId: string) {
  try {
    // First delete from user_roles table
    const { error: deleteRoleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (deleteRoleError) {
      throw deleteRoleError;
    }

    // Then delete from users table
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (deleteUserError) {
      throw deleteUserError;
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}