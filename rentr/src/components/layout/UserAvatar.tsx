import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserAvatarProps {
  onLogout: () => void;
  isCollapsed: boolean;
  initials: string;
  name: string;
}

export function UserAvatar({ onLogout, isCollapsed, initials, name }: UserAvatarProps) {
  const navigate = useNavigate();

  return (
    <div className="border-t p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={cn(
            "w-full flex items-center gap-2 p-2",
            "hover:bg-gray-100 active:bg-gray-200",
            "rounded-md transition-colors duration-150",
            !isCollapsed && "justify-start",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-8 w-8 border border-gray-600">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{name}</p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-48 bg-white shadow-lg"
        >
          <DropdownMenuItem 
            onClick={() => navigate("/settings")}
            className="hover:bg-gray-100 active:bg-gray-200 cursor-pointer focus:bg-gray-100 focus:text-black"
          >
            <Settings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onLogout}
            className="hover:bg-gray-100 active:bg-gray-200 cursor-pointer focus:bg-gray-100 focus:text-black"
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}