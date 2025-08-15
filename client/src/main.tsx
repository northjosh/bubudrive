import { render } from "preact";
import "./index.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "./trpc.ts";
import { AuthProvider, useAuth } from "./hooks/useAuth.tsx";

export const queryClient = new QueryClient();
function InnerApp() {
  const auth = useAuth()

  return   <RouterProvider router={router} context={{  auth}} />
}

render(
  <ErrorBoundary>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <InnerApp />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </ErrorBoundary>,
  document.getElementById("app")!
);
