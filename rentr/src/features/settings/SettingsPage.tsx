import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useSignOut } from "@/hooks/useAuth";
import { useAgencyUsers } from "./hooks/useAgencyUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import ProfileSettings from "./components/ProfileSettings";
import AgencyTeam from "./components/AgencyTeam";
import AgencySettings from "./components/AgencySettings";
import NotificationSettings from "./components/NotificationSettings";
import { Role } from "@/types/auth.types";

const SettingsPage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { mutate: signOut, isPending: isLoggingOut } = useSignOut();
  const { data: agencyUsers, isLoading: usersLoading } = useAgencyUsers(
    profile?.agencyid ? { agencyId: profile.agencyid } : undefined
  );
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Debug logs to identify the issue
  console.log("Debug - Current user:", user);
  console.log("Debug - User profile:", profile);
  console.log("Debug - Profile role:", profile?.role);
  console.log("Debug - Agency ID:", profile?.agencyid);
  console.log("Debug - Agency users:", agencyUsers);
  console.log("Debug - Profile error:", profileError);
  
  useEffect(() => {
    // Check multiple ways to ensure the role is properly detected
    if (
      profile?.role === Role.Admin || 
      profile?.role === "Admin" ||
      profile?.role?.toString().toLowerCase() === "admin"
    ) {
      console.log("Debug - Setting isAdmin to TRUE");
      setIsAdmin(true);
    } else {
      console.log("Debug - Setting isAdmin to FALSE, role detected as:", profile?.role);
      setIsAdmin(false);
    }
  }, [profile]);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            There was an error loading your profile. Please try refreshing the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const showAgencyTeam = profile?.agencyid || isAdmin;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, team, and agency settings
          </p>
        </div>
      </div>

      {!profile?.agencyid && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are not connected to any agency yet. Some features will be limited.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none gap-2 md:gap-0">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {showAgencyTeam && <TabsTrigger value="team">Team</TabsTrigger>}
          {showAgencyTeam && <TabsTrigger value="agency">Agency</TabsTrigger>}
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings 
            profile={profile} 
            onLogout={() => signOut()}
            isLoggingOut={isLoggingOut} 
          />
        </TabsContent>

        {showAgencyTeam && (
          <TabsContent value="team" className="space-y-6">
            <AgencyTeam 
              users={agencyUsers || []}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              isLoading={profile?.agencyid && usersLoading}
            />
          </TabsContent>
        )}

        {showAgencyTeam && (
          <TabsContent value="agency" className="space-y-6">
            <AgencySettings agencyId={profile?.agencyid} />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings 
            email={profile?.email || user?.email || ""} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
