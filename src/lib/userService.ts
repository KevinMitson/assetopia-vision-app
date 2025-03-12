import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { User } from '@/types';

/**
 * Fetches all users from the user_roles table
 */
export async function fetchAllUsers() {
  try {
    // Fetch users from user_roles with joined user data
    const { data: roleUsers, error: roleError } = await (supabase as any)
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        users:auth.users!user_id (
          id,
          email,
          created_at,
          updated_at
        ),
        roles (
          name
        )
      `)
      .order('users.email');

    if (roleError) {
      throw roleError;
    }

    console.log('Role users fetched:', roleUsers?.length || 0);

    if (!roleUsers || roleUsers.length === 0) {
      return { users: [], error: null };
    }

    // Transform role users to match the User interface
    const transformedUsers = roleUsers
      .filter(ru => ru.users) // Filter out any null users
      .map(ru => ({
        id: ru.user_id,
        full_name: ru.users.email?.split('@')[0] || ru.user_id, // Use email username as full_name
        email: ru.users.email,
        role_id: ru.role_id,
        role_name: ru.roles?.name || 'User',
        created_at: ru.users.created_at || new Date().toISOString(),
        updated_at: ru.users.updated_at || new Date().toISOString()
      }));

    console.log('Transformed users:', transformedUsers.length);

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
    const { data: authUser, error: authError } = await (supabase as any)
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (authError) {
      throw authError;
    }

    if (!authUser) {
      return { exists: false, userId: null, error: null };
    }

    // Check if user exists in user_roles
    const { data: roleUser, error: roleError } = await (supabase as any)
      .from('user_roles')
      .select('user_id')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (roleError) {
      throw roleError;
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
      // Create user in auth.users
      const { data: authData, error: authError } = await (supabase as any).auth.admin.createUser({
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
    }
    
    // Get default role if none provided
    let roleId = userData.role_id;
    if (!roleId) {
      const { data: defaultRole, error: roleError } = await (supabase as any)
        .from('roles')
        .select('id')
        .eq('name', 'User')
        .maybeSingle();
        
      if (roleError) {
        throw roleError;
      }
      
      roleId = defaultRole?.id;
      
      if (!roleId) {
        // Get any role if 'User' role doesn't exist
        const { data: anyRole, error: anyRoleError } = await (supabase as any)
          .from('roles')
          .select('id')
          .limit(1)
          .single();
          
        if (anyRoleError) {
          throw anyRoleError;
        }
        
        roleId = anyRole.id;
      }
    }
    
    if (!roleId) {
      throw new Error('No role available to assign to user');
    }
    
    // Add user to user_roles
    const { data, error } = await (supabase as any)
      .from('user_roles')
      .insert({
        user_id: authUserId,
        role_id: roleId
      })
      .select()
      .single();
    
    if (error) {
      throw error;
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