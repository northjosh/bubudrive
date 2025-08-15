import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import type { AuthContextType } from "@/hooks/useAuth";


interface RouteContext {
  auth: AuthContextType
}
export const Route = createRootRouteWithContext<RouteContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (

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

  );
}
