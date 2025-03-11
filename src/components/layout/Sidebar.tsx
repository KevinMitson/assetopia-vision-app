
import {
  BarChart3,
  Home,
  LayoutDashboard,
  Map,
  Package,
  Settings,
  User,
  User2,
  Users,
  Building,
  MapPin,
  Tag,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { MainNav } from "@/components/main-nav";
import { SidebarNavItem } from "@/components/nav";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  navItems?: SidebarNavItem[];
}

export function Sidebar({ className, navItems, ...props }: SidebarProps) {
  const routes = navItems || navigationItems;

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
                <div className="mt-1 space-y-1">
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

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Home size={20} />,
  },
  {
    title: "Stations",
    href: "/stations",
    icon: <Map size={20} />,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: <Package size={20} />,
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
    icon: <BarChart3 size={20} />,
  },
  {
    title: "Personnel",
    href: "/personnel",
    icon: <Users size={20} />,
  },
  {
    title: "Management",
    href: "#",
    icon: <Wrench size={20} />,
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
    icon: <User2 size={20} />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings size={20} />,
  },
];
