import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { MinimalLayout } from "../layouts/MinimalLayout";
import { useAuth } from "@/contexts/AuthContext";
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

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  layout = "default",
}) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
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
