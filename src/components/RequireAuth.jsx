import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUser } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isLoading: userLoading, isError } = useUser();

  // Show loading while checking auth or fetching user
  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or user fetch failed, redirect to login
  if (!isAuthenticated && isError) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
