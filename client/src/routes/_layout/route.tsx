import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar from "../../components/sidebar";
import { FolderIcon, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";
import "../../app.css";

export const Route = createFileRoute("/_layout")({
  beforeLoad: ({ context }) => {
    
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    throw redirect({ to: "/login" });
  }

  return (
    <div class="main-nav">
      <div>
        <Link to="/" class="sidenav-header">
          <FolderIcon />
          <h2>bubu</h2>
          drive
        </Link>
      </div>
      <div class="dashboard">
        <Sidebar />
        <div class="main">
          <nav class="flex justify-between items-center p-4 border-b">
            <div>Welcome, {user.username}!</div>
            <button
              onClick={logout}
              class="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
