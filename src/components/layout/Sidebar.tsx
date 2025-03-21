import {
  BarChart3,
  Home,
  Map,
  Package,
  Settings,
  User2,
  Users,
  Building,
  MapPin,
  Tag,
  ShieldCheck,
  Wrench,
  Settings2
} from "lucide-react";

import { MainNav } from "@/components/main-nav";
import { SidebarNavItem } from "@/components/nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import { ReactNode } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  navItems?: SidebarNavItem[];
}

export function Sidebar({ className, navItems, ...props }: SidebarProps) {
  const { isAdmin, userRoles } = useAuth();
  console.log("Current user roles:", userRoles);
  console.log("Is admin:", isAdmin);
  
  // Helper function to create icon element
  const createIcon = (Icon: typeof Home): ReactNode => <Icon size={20} />;
  
  // Filter navigation items based on admin status
  const getNavigationItems = (): SidebarNavItem[] => {
    const baseItems: SidebarNavItem[] = [
      {
        title: "Dashboard",
        href: "/",
        icon: createIcon(Home),
      },
      {
        title: "Stations",
        href: "/stations",
        icon: createIcon(Map),
      },
      {
        title: "Assets",
        href: "/assets",
        icon: createIcon(Package),
        submenu: [
          {
            title: "View All",
            href: "/assets",
          },
          {
            title: "Add New",
            href: "/assets/add",
          }
        ]
      },
      {
        title: "Inventory",
        href: "/inventory",
        icon: createIcon(BarChart3),
      },
      {
        title: "Personnel",
        href: "/personnel",
        icon: createIcon(Users),
      },
      {
        title: "Maintenance",
        href: "/maintenance",
        icon: createIcon(Wrench),
      },
      {
        title: "Users",
        href: "/users",
        icon: createIcon(User2),
      },
    ];
    
    // Always include Management and Permissions tabs for testing
    baseItems.push(
      {
        title: "Management",
        href: "#",
        icon: createIcon(Settings2),
        submenu: [
          {
            title: "Departments",
            href: "/management/departments",
            icon: <Building size={16} />,
          },
          {
            title: "Stations",
            href: "/management/stations",
            icon: <MapPin size={16} />,
          },
          {
            title: "Asset Types",
            href: "/management/asset-types",
            icon: <Tag size={16} />,
          },
          {
            title: "Roles",
            href: "/management/roles",
            icon: <ShieldCheck size={16} />,
          }
        ]
      },
      {
        title: "Permissions",
        href: "/permissions",
        icon: createIcon(User2),
      }
    );
    
    // Settings is available to everyone
    baseItems.push({
      title: "Settings",
      href: "/settings",
      icon: createIcon(Settings),
    });
    
    return baseItems;
  };

  const routes = navItems || getNavigationItems();

  return (
    <div
      className="flex h-full max-w-[280px] flex-col border-r bg-background py-4"
      {...props}
    >
      <ScrollArea className="flex-1 space-y-4 px-3">
        <MainNav className="flex flex-col" />
        <div className="space-y-1">
          {routes.map((item) =>
            item.submenu ? (
              <details key={item.title} className="group [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center space-x-3.5 py-2 pl-4 pr-2 text-sm font-medium rounded-md hover:bg-secondary">
                  {item.icon && (
                    <span className="h-4 w-4 opacity-70 group-hover:opacity-100">
                      {item.icon}
                    </span>
                  )}
                  <span>{item.title}</span>
                </summary>
                <div className="mt-1 space-y-1 pl-4">
                  {item.submenu.map((subItem) => (
                    <SidebarNavItem
                      key={subItem.title}
                      title={subItem.title}
                      href={subItem.href}
                      icon={subItem.icon}
                    />
                  ))}
                </div>
              </details>
            ) : (
              <SidebarNavItem
                key={item.title}
                title={item.title}
                href={item.href}
                icon={item.icon}
              />
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
