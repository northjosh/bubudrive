import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Sidebar from "../../components/sidebar";
import { FolderIcon, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";
import "../../app.css";

export const Route = createFileRoute("/_layout")({
  beforeLoad: ({ context }) => {},
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
      <div class="nav">
        <Link to="/" class="sidenav-header">
          <FolderIcon />
          <h2>bubu</h2>
          drive
        </Link>

        <div class="profile">
          <div>{user.username}!</div>
          <button
            onClick={logout}
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </div>
      <div class="dashboard">
        <Sidebar />
        <div class="main">
          <nav class="flex justify-between items-center p-4 border-b"></nav>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
