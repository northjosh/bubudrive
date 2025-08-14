import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar from "@/components/sidebar";
import { useAuth } from "../../hooks/useAuth";

import { isTokenExpired } from "../../utils/tokenUtils";
import Navbar from "@/components/Navbar";

export const Route = createFileRoute("/_layout")({
  beforeLoad: () => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      throw redirect({ to: "/login" });
    }

    if (isTokenExpired(authToken)) {
      throw redirect({ to: "/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
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
