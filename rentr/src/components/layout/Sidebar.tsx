import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { NavItem } from "./types"
import { UserAvatar } from "./UserAvatar"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "@/hooks/use-toast"

const navItems: NavItem[] = [
  { 
    icon: <Home className="size-5" />, 
    label: "Home", 
    href: "/home"
  },
  // { 
  //   icon: <Settings className="size-5" />, 
  //   label: "Settings", 
  //   href: "/settings" 
  // }, -- I'd keep this for like property settings and stuff later
  { 
    icon: <Calendar className="size-5" />, 
    label: "Availability", 
    href: "/availability" 
  }
];

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ 
  className,
  isCollapsed,
  onCollapsedChange
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  return (
    <>
      <aside 
        className={cn(
          "hidden md:flex fixed left-0 top-0 bottom-0 z-40",
          "border-r bg-white flex-col",
          "transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold">Dashboard</h2>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onCollapsedChange(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Button
              key={item.href}
              onClick={() => navigate(item.href)}
              variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-2",
                isCollapsed && "justify-center p-2"
              )}
            >
              {item.icon}
              {!isCollapsed && (
                <span className="ml-2">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>

        <UserAvatar 
          onLogout={handleLogout}
          isCollapsed={isCollapsed}
          initials="JD"
          name="John Doe"
        />
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around p-2 shadow-lg">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
            size="icon"
            onClick={() => navigate(item.href)}
            className="flex flex-col items-center justify-center h-full"
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Button>
        ))}
      </div>
    </>
  );
}