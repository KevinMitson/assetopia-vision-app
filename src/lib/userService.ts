import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { User } from '@/types';

/**
 * Fetches all users from the user_roles table
 */
export async function fetchAllUsers() {
  try {
    console.log('Fetching users from user_roles...');
    
    // First check if the roles table exists
    const { data: rolesExist, error: rolesCheckError } = await supabase
      .from('roles')
      .select('count(*)')
      .limit(1);
      
    if (rolesCheckError) {
      console.error('Error checking roles table:', rolesCheckError);
      // Create roles table if it doesn't exist
      await supabase.rpc('create_roles_if_not_exists');
    }
    
    // Fetch user_roles data with join to public.users table instead of using auth admin API
    console.log('Fetching user_roles data with user information...');
    const { data: roleUsers, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        users (
          id,
          email,
          full_name,
          department,
          station,
          designation,
          created_at,
          updated_at
        ),
        roles (
          id,
          name
        )
      `);
      
    if (roleError) {
      console.error('Error fetching user_roles with joins:', roleError);
      
      // Fallback to separate queries if join fails
      const { data: basicRoleUsers, error: basicRoleError } = await supabase
        .from('user_roles')
        .select('*');
        
      if (basicRoleError) {
        console.error('Error fetching basic user_roles:', basicRoleError);
        throw basicRoleError;
      }
      
      console.log('Successfully fetched basic user_roles:', basicRoleUsers?.length || 0);
      
      if (!basicRoleUsers || basicRoleUsers.length === 0) {
        return { users: [], error: null };
      }
      
      // Fetch roles data
      console.log('Fetching roles data...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*');
        
      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }
      
      // Create a map of role IDs to role names
      const roleMap = new Map();
      if (rolesData) {
        rolesData.forEach(role => {
          roleMap.set(role.id, role.name);
        });
      }
      
      // Fetch users data
      console.log('Fetching users data...');
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');
        
      if (usersError) {
        console.error('Error fetching users:', usersError);
      }
      
      // Create a map of user IDs to user data
      const userMap = new Map();
      if (usersData) {
        usersData.forEach(user => {
          userMap.set(user.id, user);
        });
      }
      
      // Build enhanced users from the maps
      const enhancedUsers = basicRoleUsers.map(roleUser => {
        const user = userMap.get(roleUser.user_id) || {};
        return {
          id: roleUser.user_id,
          full_name: user.full_name || `User ${roleUser.user_id.substring(0, 8)}`,
          email: user.email,
          department: user.department,
          station: user.station,
          designation: user.designation,
          role_id: roleUser.role_id,
          role_name: roleMap.get(roleUser.role_id) || 'User',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: user.updated_at || new Date().toISOString()
        };
      });
      
      console.log('Successfully built enhanced users from maps:', enhancedUsers.length);
      
      return { users: enhancedUsers as User[], error: null };
    }
    
    // Process joined data
    console.log('Successfully fetched user_roles with joins:', roleUsers?.length || 0);
    
    if (!roleUsers || roleUsers.length === 0) {
      return { users: [], error: null };
    }
    
    // Transform the joined data into the expected format
    const enhancedUsers = roleUsers.map(roleUser => {
      const user = roleUser.users || {};
      return {
        id: roleUser.user_id,
        full_name: user.full_name || `User ${roleUser.user_id.substring(0, 8)}`,
        email: user.email,
        department: user.department,
        station: user.station,
        designation: user.designation,
        role_id: roleUser.role_id,
        role_name: roleUser.roles?.name || 'User',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString()
      };
    });
    
    console.log('Successfully built enhanced users from joins:', enhancedUsers.length);
    
    // Debug: Log the first enhanced user
    if (enhancedUsers.length > 0) {
      console.log('First enhanced user:', enhancedUsers[0]);
    }
    
    return { users: enhancedUsers as User[], error: null };
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
        // Use RPC function to create user
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_user', {
          p_email: userData.email,
          p_full_name: userData.full_name,
          p_department: userData.department || null,
          p_station: userData.station || null,
          p_designation: userData.designation || null
        });
        
        if (rpcError) {
          console.error('Error using RPC to create user:', rpcError);
          
          // Fallback to direct insert if RPC fails
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert({
              email: userData.email,
              full_name: userData.full_name,
              department: userData.department,
              station: userData.station,
              designation: userData.designation
            })
            .select('id')
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          authUserId = insertData.id;
        } else {
          authUserId = rpcData;
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
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    // Update user in the users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: updates.full_name,
        department: updates.department,
        designation: updates.designation,
        station: updates.station,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    // If role_id is provided, update user_roles
    if (updates.role_id) {
      // First, check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role_id', updates.role_id)
        .maybeSingle();
        
      if (checkError) {
        throw checkError;
      }
      
      // If user doesn't have this role, update it
      if (!existingRole) {
        // Delete existing roles for this user
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
          
        if (deleteError) {
          throw deleteError;
        }
        
        // Add new role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role_id: updates.role_id
          });
          
        if (insertError) {
          throw insertError;
        }
      }
    }
    
    // Get updated user data
    const { data: userData, error: getUserError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        users (
          id,
          email,
          full_name,
          department,
          station,
          designation,
          created_at,
          updated_at
        ),
        roles (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .single();
      
    if (getUserError) {
      throw getUserError;
    }
    
    const user = userData.users || {};
    
    return { 
      success: true, 
      user: {
        id: userData.user_id,
        full_name: user.full_name || '',
        email: user.email,
        department: user.department,
        station: user.station,
        designation: user.designation,
        role_id: userData.role_id,
        role_name: userData.roles?.name,
        created_at: user.created_at,
        updated_at: user.updated_at
      } as User, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, user: null, error: error.message };
  }
}

/**
 * Imports multiple users from a data array
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
      if (!userData.full_name) {
        results.failed++;
        results.errors.push(`Missing full_name for a user`);
        continue;
      }

      // Generate email if not provided
      if (!userData.email) {
        userData.email = `${userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@placeholder.local`;
      }

      // Add the user
      const { success, error } = await addUser(userData);

      if (success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`Failed to import ${userData.full_name}: ${error}`);
      }
    }

    return results;
  } catch (error: any) {
    console.error('Error importing users:', error);
    return {
      success: 0,
      failed: users.length,
      errors: [error.message]
    };
  }
}

/**
 * Debug function to directly check user data from Supabase
 */
export async function debugUserData() {
  try {
    console.log('DEBUG: Checking direct user data from Supabase...');
    
    // Check if users table exists and has data
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
      
    if (usersError) {
      console.error('DEBUG: Error fetching users table:', usersError);
    } else {
      console.log('DEBUG: Users table data:', usersData);
    }
    
    // Direct query to user_roles with joins
    const { data: roleUsers, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        users (
          id,
          email,
          full_name,
          department,
          station,
          designation
        ),
        roles (
          id,
          name
        )
      `)
      .limit(5);
      
    if (roleError) {
      console.error('DEBUG: Error fetching user_roles with joins:', roleError);
    } else {
      console.log('DEBUG: User roles data with joins:', roleUsers);
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
    
    // Try RPC function to check user data
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_with_role', {
        user_id_param: roleUsers?.[0]?.user_id
      });
      
      if (rpcError) {
        console.error('DEBUG: Error calling get_user_with_role RPC:', rpcError);
      } else {
        console.log('DEBUG: RPC user data:', rpcData);
      }
    } catch (e) {
      console.error('DEBUG: Exception calling RPC function:', e);
    }
    
    return { success: true };
  } catch (error) {
    console.error('DEBUG: Error in debugUserData:', error);
    return { success: false, error };
  }
} 