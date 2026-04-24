import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { getRoleHomeRoute } from "@/lib/role-routing";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user?.role) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to={getRoleHomeRoute(user.role)} replace />;
    }
  }

  return <>{children}</>;
}
