
import { useState, useEffect } from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserProfile {
  full_name: string | null;
  designation: string | null;
  station: string | null;
  department: string | null;
}

export function Header() {
  const [notifications, setNotifications] = useState(3);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, designation, station, department')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          
          setUserProfile(data as UserProfile);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'AD';
  };
  
  return (
    <header className="border-b bg-card py-3 px-6 animate-slideInFromTop">
      <div className="flex items-center justify-between">
        <div className="w-1/3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search assets, stations..." 
              className="w-full rounded-full bg-background pl-9 transition-all focus-visible:ring-primary"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-96 overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">Asset Transfer Request</div>
                  <div className="text-sm text-muted-foreground">Terminal 2 station requested 5 scanners</div>
                  <div className="text-xs text-muted-foreground mt-1">10 minutes ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">Low Stock Alert</div>
                  <div className="text-sm text-muted-foreground">Security checkpoint devices are running low</div>
                  <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium">Maintenance Completed</div>
                  <div className="text-sm text-muted-foreground">Terminal 3 baggage scanners maintenance complete</div>
                  <div className="text-xs text-muted-foreground mt-1">3 hours ago</div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">View all notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full" aria-label="User menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt={userProfile?.full_name || 'User'} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{userProfile?.full_name || user?.email || 'User'}</span>
                  {userProfile?.designation && (
                    <span className="text-xs text-muted-foreground">{userProfile.designation}</span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {userProfile && (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-muted-foreground">Department: {userProfile.department || 'Not set'}</p>
                    <p className="text-xs text-muted-foreground">Station: {userProfile.station || 'Not set'}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onSelect={() => navigate('/settings')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem>Switch Station</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
