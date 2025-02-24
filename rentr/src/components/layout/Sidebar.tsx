import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  House,
  Settings,
  Wrench, // Add this import
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavItem } from "./types";
import { UserAvatar } from "./UserAvatar";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { DashboardIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  full_name: string;
}

const navItems: NavItem[] = [
  {
    icon: <DashboardIcon className="size-5" />,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: <Calendar className="size-5" />,
    label: "Availability",
    href: "/calendar",
  },
  {
    icon: <House className="size-5" />,
    label: "Properties",
    href: "/properties",
  },
  {
    icon: <Wrench className="size-5" />,
    label: "Technicians",
    href: "/tech",
  },
  {
    icon: <Settings className="size-5" />,
    label: "Settings",
    href: "/availability-settings",
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
  className,
  isCollapsed,
  onCollapsedChange,
}: SidebarProps) {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function getUserProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("users")
          .select("name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile({
            full_name: profile.name,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    getUserProfile();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
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
          {!isCollapsed && <h2 className="text-xl font-semibold">Dashboard</h2>}
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
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </nav>

        <UserAvatar
          onLogout={handleLogout}
          isCollapsed={isCollapsed}
          initials={userProfile ? getInitials(userProfile.full_name) : "??"}
          name={userProfile?.full_name || "Loading..."}
        />
      </aside>

      {/* Update the mobile navigation bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around p-2 shadow-lg">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={isActiveRoute(item.href) ? "secondary" : "ghost"}
            size="icon"
            onClick={() => navigate(item.href)}
            className="h-10 w-10" // Updated size classes
          >
            {item.icon}
          </Button>
        ))}
      </div>
    </>
  );
}
