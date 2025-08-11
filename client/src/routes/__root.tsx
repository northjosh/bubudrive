import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "../hooks/useAuth";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
