import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface SidebarLinkProps {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}

function SidebarLink({ href, icon, label, active }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <div 
        className={cn(
          "flex items-center px-4 py-3 transition-colors cursor-pointer",
          active 
            ? "bg-primary text-white"
            : "text-neutral-200 hover:bg-primary hover:text-white"
        )}
      >
        <span className="material-icons mr-3">{icon}</span>
        {label}
      </div>
    </Link>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <aside className={cn("bg-primary-dark text-white w-64 flex-shrink-0 hidden md:flex md:flex-col overflow-y-auto", className)}>
      <div className="p-4 border-b border-primary">
        <h1 className="text-xl font-sans font-bold flex items-center">
          <span className="material-icons mr-2">nature</span>
          ForestManager
        </h1>
      </div>
      
      <nav className="flex-1 mt-4">
        <div className="px-4 py-2 text-neutral-300 text-sm">MAIN NAVIGATION</div>
        <SidebarLink 
          href="/" 
          icon="dashboard" 
          label="Dashboard" 
          active={location === "/" || location === "/dashboard"}
        />
        <SidebarLink 
          href="/forest-map" 
          icon="map" 
          label="Forest Map" 
          active={location === "/forest-map"}
        />
        <SidebarLink 
          href="/inventory" 
          icon="inventory_2" 
          label="Inventory" 
          active={location === "/inventory"}
        />
        <SidebarLink 
          href="/reports" 
          icon="assignment" 
          label="Reports" 
          active={location === "/reports"}
        />
        <SidebarLink 
          href="/schedule" 
          icon="event" 
          label="Schedule" 
          active={location === "/schedule"}
        />
        
        <div className="px-4 py-2 mt-6 text-neutral-300 text-sm">ADMINISTRATION</div>
        <SidebarLink 
          href="/users" 
          icon="people" 
          label="User Management" 
          active={location === "/users"}
        />
        <SidebarLink 
          href="/settings" 
          icon="settings" 
          label="Settings" 
          active={location === "/settings"}
        />
      </nav>
    </aside>
  );
}
