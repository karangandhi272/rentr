import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, User, Upload } from "lucide-react";
import { UserAvailabilitySchedule } from "./UserAvailabilitySchedule";
import { useUpdateProfile } from "../hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsProps {
  profile: any;
  onLogout: () => void;
  isLoggingOut: boolean;
}

const ProfileSettings = ({ profile, onLogout, isLoggingOut }: ProfileSettingsProps) => {
  const { toast } = useToast();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone_number: profile?.phone_number || "",
    bio: profile?.bio || "",
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile(formData, {
      onSuccess: () => {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message || "Failed to update profile.",
        });
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and how others see you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile?.profile_picture} 
                    alt={profile?.name || "User"} 
                  />
                  <AvatarFallback className="text-2xl">
                    {profile?.name ? getInitials(profile.name) : <User />}
                  </AvatarFallback>
                </Avatar>
                
                <Button variant="outline" size="sm" type="button" className="flex gap-2">
                  <Upload className="h-4 w-4" /> Change Avatar
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email is managed through your account settings
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">Phone</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onLogout} disabled={isLoggingOut}>
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Log out
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>
            Set your weekly working hours and availability for appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAvailabilitySchedule
            userId={profile?.id}
            initialAvailability={profile?.availability || {}}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileSettings;
