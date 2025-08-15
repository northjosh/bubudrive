import { createRouter } from "@tanstack/react-router";
import { Error } from "./app";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context :{
    auth: undefined!,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: Error,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
