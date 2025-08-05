import { render } from "preact";
import "./index.css";
import "./app.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "./trpc.ts";
import { AuthProvider } from "./hooks/useAuth.tsx";

export const queryClient = new QueryClient();

render(
  <ErrorBoundary>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </ErrorBoundary>,
  document.getElementById("app")!
);
