import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "./components/ui/sidebar";
import { supabase } from "@/lib/supabaseClient";
import { LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserProfile = {
  email: string;
  first_name: string;
  last_name: string;
  username: string;
};

export default function SettingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        setProfile({
          email: user.email || "",
          first_name: user.user_metadata.first_name || "",
          last_name: user.user_metadata.last_name || "",
          username: user.user_metadata.username || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="md:ml-16 p-4 md:p-8">
      <Sidebar />
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="size-6" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <p className="text-lg">{profile?.first_name} {profile?.last_name}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Username</h3>
              <p className="text-lg">{profile?.username}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
              <p className="text-lg">{profile?.email}</p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
