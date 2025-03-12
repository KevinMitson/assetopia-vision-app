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
    
    // Fetch users from user_roles with joined user data
    const { data: roleUsers, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        users:auth.users!user_id (
          id,
          email,
          raw_user_meta_data,
          created_at,
          updated_at
        ),
        roles (
          id,
          name
        )
      `)
      .order('user_id');

    if (roleError) {
      console.error('Error fetching role users:', roleError);
      
      // If there's an error, try a simpler query without the join
      const { data: simpleRoleUsers, error: simpleRoleError } = await supabase
        .from('user_roles')
        .select('user_id, role_id');
        
      if (simpleRoleError) {
        throw simpleRoleError;
      }
      
      // If we got simple role users but no detailed data, return minimal user objects
      if (simpleRoleUsers && simpleRoleUsers.length > 0) {
        console.log('Returning minimal user data without joins');
        const minimalUsers = simpleRoleUsers.map(ru => ({
          id: ru.user_id,
          full_name: `User ${ru.user_id.substring(0, 8)}`,
          role_id: ru.role_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        return { users: minimalUsers as User[], error: null };
      }
      
      throw roleError;
    }

    console.log('Role users fetched:', roleUsers?.length || 0);
    
    // Debug: Log the first user to see its structure
    if (roleUsers && roleUsers.length > 0) {
      console.log('First user data structure:', JSON.stringify(roleUsers[0], null, 2));
    }

    if (!roleUsers || roleUsers.length === 0) {
      return { users: [], error: null };
    }

    // Transform role users to match the User interface
    const transformedUsers = roleUsers
      .filter(ru => ru.users) // Filter out any null users
      .map(ru => {
        // Extract user metadata - ensure it's properly parsed
        let metadata: {
          full_name?: string;
          department?: string;
          station?: string;
          designation?: string;
          [key: string]: any;
        } = {};
        
        try {
          if (typeof ru.users.raw_user_meta_data === 'string') {
            metadata = JSON.parse(ru.users.raw_user_meta_data);
          } else {
            metadata = ru.users.raw_user_meta_data || {};
          }
        } catch (e) {
          console.error('Error parsing user metadata:', e);
          metadata = {};
        }
        
        // Debug log for metadata
        console.log(`User ${ru.user_id} metadata:`, metadata);
        
        // Ensure we have a fallback for full_name
        const fullName = 
          metadata.full_name || 
          ru.users.email?.split('@')[0] || 
          `User ${ru.user_id.substring(0, 8)}`;
        
        return {
          id: ru.user_id,
          full_name: fullName,
          email: ru.users.email,
          department: metadata.department,
          station: metadata.station,
          designation: metadata.designation,
          role_id: ru.role_id,
          role_name: ru.roles?.name || 'User',
          created_at: ru.users.created_at || new Date().toISOString(),
          updated_at: ru.users.updated_at || new Date().toISOString()
        };
      });

    console.log('Transformed users:', transformedUsers.length);
    
    // Debug: Log the first transformed user
    if (transformedUsers.length > 0) {
      console.log('First transformed user:', transformedUsers[0]);
    }

    return { users: transformedUsers as User[], error: null };
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
    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (authError) {
      console.error('Error checking auth.users:', authError);
      return { exists: false, userId: null, error: null };
    }

    if (!authUser) {
      return { exists: false, userId: null, error: null };
    }

    // Check if user exists in user_roles
    const { data: roleUser, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (roleError) {
      console.error('Error checking user_roles:', roleError);
      return { exists: false, userId: authUser.id, error: null };
    }

    return { 
      exists: !!roleUser, 
      userId: authUser.id, 
      error: null 
    };
  } catch (error: any) {
    console.error('Error checking if user exists:', error);
    return { exists: false, userId: null, error: error.message };
  }
}

/**
 * Adds a new user to the auth.users and user_roles tables
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
    
    // If user doesn't exist in auth.users, create them
    if (!exists && !authUserId) {
      try {
        // Try to use the admin API first
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            department: userData.department,
            designation: userData.designation,
            station: userData.station
          }
        });
        
        if (authError) {
          throw authError;
        }
        
        authUserId = authData.user.id;
      } catch (adminError) {
        console.error('Error using admin API, falling back to RPC:', adminError);
        
        // Fall back to using an RPC function
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_user', {
          p_email: userData.email,
          p_full_name: userData.full_name,
          p_department: userData.department || null,
          p_station: userData.station || null,
          p_designation: userData.designation || null
        });
        
        if (rpcError) {
          throw rpcError;
        }
        
        authUserId = rpcData;
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
 * Updates an existing user in the standalone_users table
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
) {
  try {
    // Update user metadata in auth.users
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          full_name: updates.full_name,
          department: updates.department,
          designation: updates.designation,
          station: updates.station
        }
      }
    );
    
    if (authError) {
      throw authError;
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
        users:auth.users!user_id (
          id,
          email,
          raw_user_meta_data,
          created_at,
          updated_at
        ),
        roles (
          name
        )
      `)
      .eq('user_id', userId)
      .single();
      
    if (getUserError) {
      throw getUserError;
    }
    
    const metadata = userData.users.raw_user_meta_data || {};
    
    return { 
      success: true, 
      user: {
        id: userData.user_id,
        full_name: metadata.full_name || userData.users.email?.split('@')[0] || '',
        email: userData.users.email,
        department: metadata.department,
        station: metadata.station,
        designation: metadata.designation,
        role_id: userData.role_id,
        role_name: userData.roles?.name,
        created_at: userData.users.created_at,
        updated_at: userData.users.updated_at
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