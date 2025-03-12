import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Secret code to enable admin registration - change this to your preferred code
  const SECRET_ADMIN_CODE = 'ZACL_INVENTORY2025';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate admin code if admin option is selected
      if (isAdmin && adminCode !== SECRET_ADMIN_CODE) {
        throw new Error('Invalid admin code');
      }

      const { error, data } = await signUp(email, password, {
        full_name: fullName,
      });
      
      if (error) throw error;
      
      // If admin option is selected and code is valid, assign admin role
      if (isAdmin && data?.user) {
        // Check if roles table has Admin role
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'Admin')
          .single();
          
        if (rolesError && rolesError.code !== 'PGRST116') {
          throw rolesError;
        }
        
        let adminRoleId;
        
        if (!rolesData) {
          // Create Admin role if it doesn't exist
          const { data: newRole, error: newRoleError } = await supabase
            .from('roles')
            .insert({ name: 'Admin', description: 'System Administrator with full access' })
            .select('id')
            .single();
            
          if (newRoleError) throw newRoleError;
          adminRoleId = newRole.id;
        } else {
          adminRoleId = rolesData.id;
        }
        
        // Assign Admin role to the user
        const { error: userRoleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role_id: adminRoleId
          });
          
        if (userRoleError) throw userRoleError;
        
        toast({
          title: "Admin account created",
          description: "Your admin account has been created successfully",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account",
        });
      }
      
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your ZACL_INVENTORY account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAdmin" 
                checked={isAdmin}
                onCheckedChange={(checked) => setIsAdmin(checked === true)}
              />
              <label
                htmlFor="isAdmin"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Register as Administrator
              </label>
            </div>
            
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="adminCode">Admin Code</Label>
                <Input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required={isAdmin}
                  placeholder="Enter admin registration code"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register; 