import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { UserProfile } from '@/types/user';

type ProfileCardProps = {
  profile?: UserProfile;
  onLogout: () => void;
  isLoggingOut: boolean;
};

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-2">
    <h3 className="font-medium text-sm text-muted-foreground">{label}</h3>
    <p className="text-lg">{value}</p>
  </div>
);

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  onLogout, 
  isLoggingOut 
}) => {
  if(!profile) return null;
  
  return (
  <Card>
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl flex items-center gap-2">
        <User className="size-6" />
        Profile Settings
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <ProfileField 
        label="Name" 
        value={`${profile.first_name} ${profile.last_name}`} 
      />
      <ProfileField 
        label="Username" 
        value={profile.username} 
      />
      <ProfileField 
        label="Email" 
        value={profile.email} 
      />
      <div className="pt-4">
        <Button 
          onClick={onLogout}
          variant="destructive"
          className="w-full sm:w-auto"
          disabled={isLoggingOut}
        >
          <LogOut className="mr-2 size-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </CardContent>
  </Card>
)};

export default ProfileCard;