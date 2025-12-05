import { useUser, useLogout } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Alert } from "../components/ui/Alert";
import { Shield, Loader2, User, Mail, LogOut } from "lucide-react";

export default function Dashboard() {
  const { data: user, isLoading, isError, error } = useUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Alert variant="error">
            {error?.response?.data?.message ||
              "Failed to load user profile. Please try again."}
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                SecureAuth
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Card */}
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">
                Welcome back, {user?.email?.split("@")[0] || "User"}!
              </CardTitle>
              <CardDescription>
                You're successfully logged in to your account
              </CardDescription>
            </CardHeader>
          </Card>

          {/* User Profile Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Your Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-base font-semibold text-gray-900">
                    {user?.email || "Not available"}
                  </p>
                </div>
              </div>

              {user?.id && (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-base font-mono text-gray-900">
                      {user.id}
                    </p>
                  </div>
                </div>
              )}

              {user?.createdAt && (
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">
                      Member Since
                    </p>
                    <p className="text-base text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Secure Session
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  Your session is protected with JWT tokens. Access tokens are
                  stored in memory and refresh tokens are automatically managed
                  for enhanced security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
