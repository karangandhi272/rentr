import { useUserProfile, useSignOut } from "@/hooks/useAuth";
import { useState } from "react";
import ProfileCard from "./components/ProfileCard";
import { EmailSettings } from "./components/EmailSettings";

const SettingsPage = () => {
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: signOut, isPending: isLoggingOut } = useSignOut();
  const [isEmailConnected, setIsEmailConnected] = useState(false);

  if (isLoading) {
    return <>Loading!!</>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="space-y-6">
        <ProfileCard
          profile={profile}
          onLogout={() => signOut()}
          isLoggingOut={isLoggingOut}
        />
        <EmailSettings
          email={profile?.email || ""}
          isConnected={isEmailConnected}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
