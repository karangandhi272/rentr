import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile, useSignOut } from "@/hooks/useAuth";
import { useAgencyUsers } from "./hooks/useAgencyUsers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

import ProfileSettings from "./components/ProfileSettings";
import AgencyTeam from "./components/AgencyTeam";
import AgencySettings from "./components/AgencySettings";
import NotificationSettings from "./components/NotificationSettings";
import { Role } from "@/types/auth.types";

const SettingsPage = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { mutate: signOut, isPending: isLoggingOut } = useSignOut();
  const { data: agencyUsers, isLoading: usersLoading } = useAgencyUsers();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    if (profile?.role === Role.Admin) {
      setIsAdmin(true);
    }
  }, [profile]);

  if (profileLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, team, and agency settings
          </p>
        </div>
        {profile?.role && (
          <Badge variant="outline" className="px-3 py-1">
            {profile.role}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-2 md:grid-cols-none gap-2 md:gap-0">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="agency">Agency</TabsTrigger>
          )}
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings 
            profile={profile} 
            onLogout={() => signOut()}
            isLoggingOut={isLoggingOut} 
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <AgencyTeam 
            users={agencyUsers || []}
            isAdmin={isAdmin}
            currentUserId={user?.id}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="agency" className="space-y-6">
            <AgencySettings agencyId={profile?.agencyid} />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings 
            email={profile?.email || ""} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
