import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";
import { User } from '@supabase/supabase-js';

const ProtectedRoute = () => {

  
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

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;