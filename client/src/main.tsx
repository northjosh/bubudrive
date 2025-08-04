import { render } from "preact";
import "./index.css";
import "./app.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "./trpc.ts";

export const queryClient = new QueryClient();

render(
  <ErrorBoundary>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  </ErrorBoundary>,
  document.getElementById("app")!
);
