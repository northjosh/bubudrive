import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "../../components/sidebar";
import { FolderIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import "../../app.css"

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
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
          <nav></nav>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
