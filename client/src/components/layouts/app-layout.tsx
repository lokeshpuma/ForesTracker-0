import { useState, ReactNode } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}>
          <Sidebar className="absolute transition-transform transform duration-300 ease-in-out" />
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-neutral-200 flex items-center justify-between p-4 h-16">
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-neutral-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center bg-neutral-100 rounded-md px-3 py-2 flex-1 max-w-xl mx-4">
            <Search className="h-5 w-5 text-neutral-500 mr-2" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none text-neutral-700 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
          </div>

          {/* Right side controls */}
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-neutral-100 text-neutral-700">
              <Bell className="h-5 w-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-4 flex items-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User Avatar" />
                    <AvatarFallback>JF</AvatarFallback>
                  </Avatar>
                  <span className="ml-2 font-medium text-neutral-800 mobile-hidden">John Forester</span>
                  <span className="material-icons text-neutral-500 ml-1">arrow_drop_down</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      
      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
