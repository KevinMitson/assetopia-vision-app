
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarNavItem {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ReactNode | LucideIcon;
  href?: string;
  submenu?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
  }[];
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ReactNode;
  href?: string;
}

export function SidebarNavItem({
  className,
  title,
  href,
  disabled,
  external,
  icon,
  ...props
}: SidebarNavItemProps) {
  return (
    <div
      className={cn(
        "flex py-2 px-4 cursor-pointer hover:bg-secondary rounded-md",
        disabled && "cursor-not-allowed opacity-60",
        className
      )}
      {...props}
    >
      {href ? (
        <Link
          to={disabled || !href ? "#" : href}
          className={cn(
            "w-full flex items-center gap-3 text-sm font-medium",
            disabled && "cursor-not-allowed opacity-60"
          )}
          target={external ? "_blank" : ""}
          rel={external ? "noreferrer" : ""}
        >
          {icon && <span className="opacity-70">{icon}</span>}
          <span>{title}</span>
        </Link>
      ) : (
        <span className="w-full flex items-center gap-3 text-sm font-medium">
          {icon && <span className="opacity-70">{icon}</span>}
          <span>{title}</span>
        </span>
      )}
    </div>
  );
}
