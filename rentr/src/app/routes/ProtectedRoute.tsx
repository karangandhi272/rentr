import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";
import { User } from '@supabase/supabase-js';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import { MinimalLayout } from '../layouts/MinimalLayout';
type LayoutConfig = {
  [key: string]: React.FC<{ children: React.ReactNode }>;
};

const layouts: LayoutConfig = {
  default: AuthenticatedLayout,
  minimal: MinimalLayout,
};

interface ProtectedRouteProps {
  layout?: keyof typeof layouts;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ layout = 'default' }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const Layout = layouts[layout];
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};