import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  Calendar, 
  Users, 
  Settings 
} from "lucide-react"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

type NavItem = {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}



export function Sidebar({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true)

  const navItems: NavItem[] = [
    { 
      icon: <Home className="size-5" />, 
      label: "Home", 
      href: "/home",
      active: true 
    },
   
    { 
      icon: <Settings className="size-5" />, 
      label: "Settings", 
      href: "/settings" 
    },
    { 
      icon: <Calendar className="size-5" />, 
      label: "Availability", 
      href: "/availability" 
    }
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex fixed left-0 top-0 bottom-0 z-50 border-r bg-white flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {!collapsed && (
            <h2 className="text-xl font-semibold">Dashboard</h2>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <Button
              key={item.href}
              onClick={()=> navigate(item.href)}
              variant={item.active ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-2",
                collapsed && "justify-center p-2"
              )}
            >
              {item.icon}
              {!collapsed && (
                <span className="ml-2">{item.label}</span>
              )}
            </Button>
          ))}
        </nav>

        {!collapsed && (
          <div className="border-t p-4 text-sm text-muted-foreground">
            © 2024 Your Company
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50 flex justify-around p-2 shadow-lg">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={item.active ? "secondary" : "ghost"}
            size="icon"
            onClick={()=> navigate(item.href)}
            className="flex flex-col items-center justify-center h-full"
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Button>
        ))}
      </div>
    </>
  )
}