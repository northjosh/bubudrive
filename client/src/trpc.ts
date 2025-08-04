import {
  createTRPCReact,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/react-query";
import type { AppRouter } from "../../server/trpc";

const url = "http://localhost:9000/trpc";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url,
      }),
      false: httpBatchLink({
        url,
      }),
    }),
  ],
});
