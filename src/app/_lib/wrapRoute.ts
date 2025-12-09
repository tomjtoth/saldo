import { NextRequest } from "next/server";

import { err, ErrorWithStatus } from "@/app/_lib/utils";
import { currentUser, User } from "../(users)/_lib";

type RouteHandler<P, R> = (req: NextRequest, ctx: RequestContext<P>) => R;

type RequestContext<P> = {
  params: Promise<P>;
};

interface HandlerContext<P> {
  req: NextRequest;
  params: P;
}

interface HandlerContextWithUser<P> extends HandlerContext<P> {
  user: User;
}

interface OptionsWithUser<P> {
  redirectAs?: (ctx: HandlerContext<P>) => string;
  allowInProd?: true;
}

interface Options<P> extends OptionsWithUser<P> {
  requireSession: false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerReturnType = Promise<any>;

type Handler<P> = (ctx: HandlerContext<P>) => HandlerReturnType;
type HandlerWithUser<P> = (ctx: HandlerContextWithUser<P>) => HandlerReturnType;

function wrapRoute<P extends object = object, R = ReturnType<Handler<P>>>(
  options: Options<P>,
  handler: Handler<P>
): RouteHandler<P, R>;

function wrapRoute<
  P extends object = object,
  R = ReturnType<HandlerWithUser<P>>
>(options: OptionsWithUser<P>, handler: HandlerWithUser<P>): RouteHandler<P, R>;

function wrapRoute<P extends object = object, R = ReturnType<Handler<P>>>(
  handler: HandlerWithUser<P>
): RouteHandler<P, R>;

function wrapRoute<P extends object = object>(
  objOrFn: OptionsWithUser<P> | Options<P> | HandlerWithUser<P>,
  maybeFn?: Handler<P> | HandlerWithUser<P>
) {
  return async (req: NextRequest, cx: RequestContext<P>) => {
    const hasOptions = typeof objOrFn !== "function";

    const {
      redirectAs,
      allowInProd = false,
      ...rest
    } = hasOptions ? objOrFn : {};

    const { requireSession = true } = "requireSession" in rest ? rest : {};

    const handler = hasOptions ? maybeFn : objOrFn;

    try {
      if (!allowInProd && process.env.NODE_ENV === "production")
        err(404, { args: { url: req.url, allowInProd } });

      let res: unknown;
      const params = await cx.params;

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

export default wrapRoute;
