import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar from "@/components/sidebar";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "@/components/Navbar";

export const Route = createFileRoute("/_layout")({
  beforeLoad: ({context}) => {
    // Don't redirect if we're still loading the auth state
    if (context.auth.isLoading) {
      return;
    }
    
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    throw redirect({ to: "/login" });
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto">
          <Navbar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
