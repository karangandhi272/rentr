import { useState, useEffect } from "react";
import { AgencyUser } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Plus, 
  User as UserIcon, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Mail,
  Shield,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role } from "@/types/auth.types";
import { useUpdateUserRole } from "../hooks/useAgencyUsers";
import { useToast } from "@/hooks/use-toast";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { UserAvailabilityDialog } from "./UserAvailabilityDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useAddAgencyUser } from "../hooks/useAgencyUsers";

interface AgencyTeamProps {
  users: AgencyUser[];
  isAdmin: boolean;
  currentUserId?: string;
  isLoading?: boolean;
}

const AgencyTeam = ({ users, isAdmin, currentUserId, isLoading = false }: AgencyTeamProps) => {
  const [selectedUser, setSelectedUser] = useState<AgencyUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const addAgencyUser = useAddAgencyUser();

  useEffect(() => {
    console.log("AgencyTeam - isAdmin prop:", isAdmin);
  }, [isAdmin]);

  const [localIsAdmin, setLocalIsAdmin] = useState(isAdmin);
  useEffect(() => {
    setLocalIsAdmin(isAdmin);
    console.log("AgencyTeam - localIsAdmin set to:", isAdmin);
    
    // Uncomment to force admin access for testing
    // setLocalIsAdmin(true);
  }, [isAdmin]);

  const handleChangeRole = (userId: string, currentRole: Role) => {
    const newRole = currentRole === Role.Admin ? Role.User : Role.Admin;
    
    updateRole(
      { userId, role: newRole },
      {
        onSuccess: () => {
          toast({
            title: "Role updated",
            description: `User role has been changed to ${newRole}`,
          });
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to update role",
            description: error.message || "There was an error updating the user role.",
          });
        }
      }
    );
  };

  const ensureSession = async () => {
    try {
      // Get current session to ensure we're still logged in as the correct user
      const { data } = await supabase.auth.getSession();
      
      // Log for debugging
      console.log("Current session user:", data.session?.user?.id);
      console.log("Expected user:", user?.id);
      
      // If session mismatch, reload the page to restore the correct session
      if (data.session?.user?.id !== user?.id) {
        console.warn("Session mismatch detected, reloading application");
        window.location.reload();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking session:", error);
      return true; // Continue anyway
    }
  };

  const handleAddMember = async (data: any) => {
    setIsAdding(true);
    
    try {
      // First, ensure we have the correct session
      const sessionValid = await ensureSession();
      if (!sessionValid) return;
      
      // Proceed with adding the user
      await addAgencyUser.mutateAsync({
        email: data.email,
        name: data.name,
        role: data.role,
      });
      
      // Show success message
      toast({
        title: "Team member added",
        description: `${data.email} has been added to your agency.`,
      });
      
      // Double-check session after adding to ensure it didn't change
      await ensureSession();
      
      // Close the dialog after successful addition
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding team member:", error);
      
      // Show more specific error for admin API issues
      let errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      if (errorMessage.includes("admin")) {
        errorMessage = "Admin privileges required. Please contact your system administrator.";
      }
      
      toast({
        variant: "destructive",
        title: "Failed to add team member",
        description: errorMessage,
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          View and manage your agency's team members
          {localIsAdmin && <span className="ml-2 text-green-600">(Admin Access)</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <div className="p-2 border-b bg-muted/40 flex items-center justify-between">
            <div className="font-medium">Team Members ({users.length})</div>
            {localIsAdmin && (
              <Button 
                onClick={() => {
                  console.log("Add Member button clicked");
                  setIsAddDialogOpen(true);
                }} 
                size="sm"
                variant="outline"
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Member
              </Button>
            )}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile_picture || ""} />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.name || "Unnamed User"}
                          {user.id === currentUserId && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === Role.Admin ? "default" : "outline"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {user.is_active ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                        <span>Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setIsAvailabilityDialogOpen(true);
                          }}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          View Availability
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem
                          onClick={() => {
                            window.location.href = `mailto:${user.email}`;
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        
                        {isAdmin && user.id !== currentUserId && (
                          <DropdownMenuItem
                            onClick={() => handleChangeRole(user.id, user.role)}
                            disabled={isUpdatingRole}
                          >
                            {isUpdatingRole ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Shield className="h-4 w-4 mr-2" />
                            )}
                            Make {user.role === Role.Admin ? "User" : "Admin"}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center">
                      <UserIcon className="h-8 w-8 text-muted-foreground/60 mb-2" />
                      <p className="text-muted-foreground">
                        No team members found
                      </p>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => setIsAddDialogOpen(true)}
                        >
                          Add Your First Team Member
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AddTeamMemberDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            console.log("Dialog open state changing to:", open);
            setIsAddDialogOpen(open);
          }}
        />
        
        <UserAvailabilityDialog
          user={selectedUser}
          open={isAvailabilityDialogOpen}
          onOpenChange={setIsAvailabilityDialogOpen}
        />
      </CardContent>
    </Card>
  );
};

export default AgencyTeam;
