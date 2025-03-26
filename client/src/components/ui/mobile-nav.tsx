import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [location] = useLocation();
  
  return (
    <nav className={cn("md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center h-16 px-2 z-10", className)}>
      <Link href="/">
        <div className={cn(
          "flex flex-col items-center justify-center cursor-pointer",
          location === "/" || location === "/dashboard" ? "text-primary" : "text-neutral-500"
        )}>
          <span className="material-icons">dashboard</span>
          <span className="text-xs mt-1">Dashboard</span>
        </div>
      </Link>
      
      <Link href="/forest-map">
        <div className={cn(
          "flex flex-col items-center justify-center cursor-pointer",
          location === "/forest-map" ? "text-primary" : "text-neutral-500"
        )}>
          <span className="material-icons">map</span>
          <span className="text-xs mt-1">Map</span>
        </div>
      </Link>
      
      <Link href="/inventory">
        <div className={cn(
          "flex flex-col items-center justify-center cursor-pointer",
          location === "/inventory" ? "text-primary" : "text-neutral-500"
        )}>
          <span className="material-icons">inventory_2</span>
          <span className="text-xs mt-1">Inventory</span>
        </div>
      </Link>
      
      <Link href="/reports">
        <div className={cn(
          "flex flex-col items-center justify-center cursor-pointer",
          location === "/reports" ? "text-primary" : "text-neutral-500"
        )}>
          <span className="material-icons">assignment</span>
          <span className="text-xs mt-1">Reports</span>
        </div>
      </Link>
      
      <Link href="/schedule">
        <div className={cn(
          "flex flex-col items-center justify-center cursor-pointer",
          location === "/schedule" ? "text-primary" : "text-neutral-500"
        )}>
          <span className="material-icons">more_horiz</span>
          <span className="text-xs mt-1">More</span>
        </div>
      </Link>
    </nav>
  );
}
