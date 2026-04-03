import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  if (currentUser?.system_role !== "super_admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
