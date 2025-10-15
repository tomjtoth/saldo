import { NextRequest } from "next/server";

import { currentUser } from "@/lib/services/users";
import { err, ErrorWithStatus } from "./utils";

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

interface Options<P> {
  redirectAs?: (ctx: HandlerContext<P>) => string;
}

interface MoreOptions<P> extends Options<P> {
  requireSession?: false;
  onlyDuringDevelopment?: true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerReturnType = Promise<any>;

type Handler<P, HC = HandlerContext<P>> = (ctx: HC) => HandlerReturnType;
type HandlerWithUser<P> = (ctx: HandlerContextWithUser<P>) => HandlerReturnType;

function protectedRoute<P, R = ReturnType<Handler<P>>>(
  options: MoreOptions<P>,
  handler: Handler<P>
): RouteHandler<P, R>;

function protectedRoute<P, R = ReturnType<Handler<P>>>(
  options: Options<P>,
  handler: HandlerWithUser<P>
): RouteHandler<P, R>;

function protectedRoute<P, R = ReturnType<Handler<P>>>(
  handler: HandlerWithUser<P>
): RouteHandler<P, R>;

function protectedRoute<P>(
  optsOrHandler: (MoreOptions<P> | Options<P>) | HandlerWithUser<P>,
  maybeHandler?: Handler<P> | HandlerWithUser<P>
) {
  return async (req: NextRequest, cx?: RequestContext<P>) => {
    const hasOptions = typeof optsOrHandler !== "function";

    const { redirectAs } = hasOptions ? optsOrHandler : {};
    const { requireSession = true, onlyDuringDevelopment = false } =
      hasOptions &&
      "requireSession" in optsOrHandler &&
      typeof optsOrHandler.requireSession === "boolean"
        ? optsOrHandler
        : {};

    const handler = hasOptions ? maybeHandler : optsOrHandler;

    try {
      if (onlyDuringDevelopment && process.env.NODE_ENV !== "development")
        err(404);

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
      const { message, status = 400 } = err as ErrorWithStatus;

      if (message === "NEXT_REDIRECT") throw err;

      return new Response(null, { status, statusText: message });
    }
  };
}

export default protectedRoute;
