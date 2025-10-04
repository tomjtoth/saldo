import { NextRequest } from "next/server";

import { currentUser } from "@/lib/services/users";
import { ErrorWithStatus } from "./utils";

type RouteHandler<P, R> = (req: NextRequest, ctx: RequestContext<P>) => R;

type RequestContext<P> = {
  params: Promise<P>;
};

interface HandlerContext<P> {
  req: NextRequest;
  params: P;
}

interface HandlerContextWithUser<P> extends HandlerContext<P> {
  user: Awaited<ReturnType<typeof currentUser>>;
}

interface OptionsWithUser<P> {
  redirectAs?: (ctx: HandlerContext<P>) => string;
}

interface OptionsWithParams<P> extends OptionsWithUser<P> {
  requireSession: false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerReturnType = Promise<any>;

type Handler<P, HC = HandlerContext<P>> = (ctx: HC) => HandlerReturnType;
type HandlerWithUser<P> = (ctx: HandlerContextWithUser<P>) => HandlerReturnType;

function protectedRoute<P, R = ReturnType<Handler<P>>>(
  options: OptionsWithParams<P>,
  handler: Handler<P>
): RouteHandler<P, R>;

function protectedRoute<P, R = ReturnType<Handler<P>>>(
  options: OptionsWithUser<P>,
  handler: HandlerWithUser<P>
): RouteHandler<P, R>;

function protectedRoute<P, R = ReturnType<Handler<P>>>(
  handler: HandlerWithUser<P>
): RouteHandler<P, R>;

function protectedRoute<P>(
  optsOrHandler:
    | (OptionsWithParams<P> | OptionsWithUser<P>)
    | HandlerWithUser<P>,
  maybeHandler?: Handler<P> | HandlerWithUser<P>
) {
  return async (req: NextRequest, cx?: RequestContext<P>) => {
    const hasOptions = typeof optsOrHandler !== "function";

    const { redirectAs } = hasOptions ? optsOrHandler : {};
    const { requireSession = true } =
      hasOptions &&
      "requireSession" in optsOrHandler &&
      typeof optsOrHandler.requireSession === "boolean"
        ? optsOrHandler
        : {};

    const handler = hasOptions ? maybeHandler : optsOrHandler;

    try {
      let res: unknown;
      const params = (await cx?.params) as P;

      if (requireSession) {
        const user = await currentUser({
          redirectTo: redirectAs ? redirectAs({ req, params }) : undefined,
        });

        res = await (handler as HandlerWithUser<P>)({ req, params, user });
      } else {
        res = await (handler as Handler<P>)({ req, params });
      }

      if (res instanceof Response) return res;
      if (res !== null && res !== undefined) return Response.json(res);

      return new Response(null, { status: 200 });
    } catch (err: unknown) {
      return new Response(null, {
        status: (err as ErrorWithStatus).status ?? 400,
        statusText: (err as Error).message,
      });
    }
  };
}

export default protectedRoute;
