
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface UserRole {
  role: string;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserRoles = async (userId: string) => {
    try {
      // In a real application, this would fetch from a 'user_roles' table
      // For now, we're using mock data for demonstration
      // Mock admin for testing (userId starting with 'a' is admin)
      if (userId.startsWith('a')) {
        setUserRoles(['Admin']);
        setIsAdmin(true);
      } else {
        // For demo purposes, let's consider all users with 'System Administrator' role as admins
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        if (rolesData && rolesData.length > 0) {
          const roles = rolesData.map((r: UserRole) => r.role);
          setUserRoles(roles);
          setIsAdmin(roles.includes('Admin') || roles.includes('System Administrator'));
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
