import { initTRPC } from '@trpc/server'
import * as trpcExpress from "@trpc/server/adapters/express"

export const createContext = ({
    req, res,
}: trpcExpress.CreateExpressContextOptions) => ({

});

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;


export const appRouter = router({
    hello: procedure.query(() => "ola trpC!")
});

export type AppRouter = typeof appRouter;

