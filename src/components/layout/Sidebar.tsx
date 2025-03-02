
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Box, 
  Clock, 
  LogOut, 
  Map, 
  Menu, 
  Package, 
  Settings, 
  Shield, 
  User, 
  Users, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isCollapsed: boolean;
}

const NavItem = ({ icon: Icon, label, path, isCollapsed }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to={path} 
            className={cn(
              "flex items-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-all",
              isCollapsed ? "justify-center" : "",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon size={isCollapsed ? 20 : 18} />
            {!isCollapsed && <span>{label}</span>}
          </Link>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "flex flex-col border-r bg-card h-screen transition-all duration-300 ease-in-out sticky top-0 left-0",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center p-4">
        {!isCollapsed && (
          <h1 className="text-lg font-semibold animate-fadeIn">AssetVision</h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("ml-auto", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-auto py-2 px-3">
        <nav className="flex flex-col gap-1">
          <NavItem icon={BarChart3} label="Dashboard" path="/" isCollapsed={isCollapsed} />
          <NavItem icon={Package} label="Assets" path="/assets" isCollapsed={isCollapsed} />
          <NavItem icon={Clock} label="Activity" path="/activity" isCollapsed={isCollapsed} />
          <NavItem icon={Box} label="Inventory" path="/inventory" isCollapsed={isCollapsed} />
          <NavItem icon={Map} label="Stations" path="/stations" isCollapsed={isCollapsed} />
          <NavItem icon={Users} label="Personnel" path="/personnel" isCollapsed={isCollapsed} />
          <NavItem icon={Shield} label="Permissions" path="/permissions" isCollapsed={isCollapsed} />
          <NavItem icon={Settings} label="Settings" path="/settings" isCollapsed={isCollapsed} />
        </nav>
      </div>
      
      <Separator />
      
      <div className="p-3">
        <div className={cn(
          "flex items-center gap-2 rounded-md py-2 px-3",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder.svg" alt="Profile" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Admin</span>
            </div>
          )}
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className={isCollapsed ? "mx-auto" : ""}>
                  <LogOut size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
