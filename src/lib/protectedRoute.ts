import { NextRequest } from "next/server";

import { auth, signIn } from "@/auth";
import { currentUser } from "@/lib/services/users";
import { err, ErrorWithStatus } from "./utils";

interface RequestWithParams<P> extends NextRequest {
  __params?: P;
}

interface RequestWithUser<P> extends RequestWithParams<P> {
  __user: Awaited<ReturnType<typeof currentUser>>;
}

type RequestContext<P> = { params: Promise<P> };

interface OptionsWithUser<P> {
  redirectAs?: (req: RequestWithParams<P>) => string;
}

interface OptionsWithParams<P> extends OptionsWithUser<P> {
  requireSession: false;
}

type Handler<P, R = unknown> = (req: RequestWithParams<P>) => Promise<R>;

type HandlerWithUser<P, R = unknown> = (req: RequestWithUser<P>) => Promise<R>;

function protectedRoute<P>(
  options: OptionsWithParams<P>,
  handler: Handler<P>
): Handler<P, Response>;

function protectedRoute<P>(
  options: OptionsWithUser<P>,
  handler: HandlerWithUser<P>
): HandlerWithUser<P, Response>;

function protectedRoute<P>(
  handler: HandlerWithUser<P>
): HandlerWithUser<P, Response>;

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
      const reqWithParams = req as RequestWithParams<P>;
      reqWithParams.__params = await cx?.params;

      if (requireSession) {
        const reqWithUser = reqWithParams as RequestWithUser<P>;
        reqWithUser.__user = await currentUser({
          redirectTo: redirectAs ? redirectAs(reqWithParams) : undefined,
        });

        res = await (handler as HandlerWithUser<P>)(reqWithUser);
      } else res = await (handler as Handler<P>)(reqWithParams);

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
