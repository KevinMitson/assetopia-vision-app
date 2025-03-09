
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  return (
    <div className={cn("flex items-center mb-4", className)}>
      <Link to="/" className="flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          Assetopia Vision
        </span>
      </Link>
    </div>
  );
}
