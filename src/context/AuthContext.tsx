
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface UserRole {
  id: string;
  role_id: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRoles: string[];
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{
    error: Error | null;
    data: any;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { [key: string]: any }) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Super admin credentials for development/testing
const SUPER_ADMIN = {
  email: 'kevin.mitson@example.com',
  password: 'password',
  name: 'Kevin Mitson'
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserRoles = async (userId: string) => {
    try {
      // Check if the user is our super admin
      if (user?.email === SUPER_ADMIN.email) {
        setUserRoles(['Admin', 'Super Admin']);
        setIsAdmin(true);
        return;
      }
      
      // In a real application, this would fetch from a 'user_roles' table
      // For now, we're using mock data for demonstration
      // Mock admin for testing (userId starting with 'a' is admin)
      if (userId.startsWith('a')) {
        setUserRoles(['Admin']);
        setIsAdmin(true);
      } else {
        // For demo purposes, let's consider all users with 'System Administrator' role as admins
        const { data: rolesData, error } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', userId);
        
        if (error) {
          console.error('Error fetching user roles:', error);
          setUserRoles(['User']);
          setIsAdmin(false);
          return;
        }
        
        if (rolesData && rolesData.length > 0) {
          // Fetch the role names based on role_ids
          const roleIds = rolesData.map((r: UserRole) => r.role_id);
          
          const { data: roleNames, error: rolesError } = await supabase
            .from('roles')
            .select('name')
            .in('id', roleIds);
            
          if (rolesError) {
            console.error('Error fetching role names:', rolesError);
            setUserRoles(['User']);
            setIsAdmin(false);
            return;
          }
          
          if (roleNames && roleNames.length > 0) {
            const roles = roleNames.map((r: { name: string }) => r.name);
            setUserRoles(roles);
            setIsAdmin(roles.includes('Admin') || roles.includes('System Administrator'));
          } else {
            setUserRoles(['User']);
            setIsAdmin(false);
          }
        } else {
          // Default role
          setUserRoles(['User']);
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      // Default to basic user in case of error
      setUserRoles(['User']);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRoles(session.user.id);
      } else {
        setUserRoles([]);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check for superadmin credentials
      if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
        // Create a mock session for superadmin without actually authenticating with Supabase
        const mockUser = {
          id: 'super-admin-id',
          email: SUPER_ADMIN.email,
          user_metadata: {
            full_name: SUPER_ADMIN.name,
          },
        } as User;
        
        const mockSession = {
          user: mockUser,
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600 * 1000,
        } as Session;
        
        setUser(mockUser);
        setSession(mockSession);
        setUserRoles(['Admin', 'Super Admin']);
        setIsAdmin(true);
        
        toast({
          title: "Welcome Super Admin",
          description: "You are logged in as Super Admin",
        });
        
        return { error: null, data: mockSession };
      }
      
      // Regular Supabase authentication for other users
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (response.error) {
        return { error: response.error, data: null };
      }
      
      if (response.data.user) {
        await fetchUserRoles(response.data.user.id);
      }
      
      return { error: null, data: response.data.session };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (response.error) {
        return { error: response.error, data: null };
      }
      
      return { error: null, data: response.data };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRoles([]);
    setIsAdmin(false);
  };

  const updateProfile = async (data: { [key: string]: any }) => {
    try {
      if (!user) {
        return { error: new Error('No authenticated user found'), success: false };
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          ...data, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      
      if (error) {
        return { error, success: false };
      }
      
      return { error: null, success: true };
    } catch (error) {
      return { error: error as Error, success: false };
    }
  };

  const value = {
    session,
    user,
    loading,
    userRoles,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
