import { Outlet, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "../hooks/useAuth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthProvider>
       <>
       <Toaster />
      <Outlet />
      <ReactQueryDevtools
        initialIsOpen={false}
        position="bottom"
        buttonPosition="bottom-right"
      />
      <TanStackRouterDevtools position="bottom-right" />
    </>
    </AuthProvider>
  );
}
