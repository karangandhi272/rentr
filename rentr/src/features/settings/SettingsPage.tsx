import { useUserProfile, useSignOut } from '@/hooks/useAuth';
import ProfileCard from './components/ProfileCard';

const SettingsPage = () => {
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: signOut, isPending: isLoggingOut } = useSignOut();

  if (isLoading) {
    return <>Loading!!</>
  }

  return (
    <div className="w-full">
      <div className="max-w space-y-6">
        <ProfileCard 
          profile={profile}
          onLogout={() => signOut()}
          isLoggingOut={isLoggingOut}
        />
      </div>
    </div>
  );
};

export default SettingsPage;