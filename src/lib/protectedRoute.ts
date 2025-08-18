import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { err, ErrorWithStatus } from "./utils";

interface ReqWithUser extends NextRequest {
  __user: Awaited<ReturnType<typeof currentUser>>;
}

type RouteOptions = { withoutUser?: true };
type RouteLogic<T = unknown> = (req: NextRequest) => Promise<T>;
type ProtectedRouteLogic<T = unknown> = (req: ReqWithUser) => Promise<T>;

type Fn = {
  (opts: RouteOptions, routeLogic: RouteLogic): RouteLogic<Response>;
  (routeLogic: ProtectedRouteLogic): ProtectedRouteLogic<Response>;
};

const protectedRoute: Fn =
  (optsOrLogic: RouteOptions | ProtectedRouteLogic, maybeLogic?: RouteLogic) =>
  async (req: NextRequest) => {
    const first = typeof optsOrLogic === "function";

    const opts = first ? {} : optsOrLogic;
    const routeLogic = first ? maybeLogic : optsOrLogic;
    const { withoutUser } = opts;

    try {
      let res: unknown;

      if (withoutUser) res = await (routeLogic as RouteLogic)(req);
      else {
        const sess = await auth();
        if (!sess) err(401);
        const reqWithUser = req as ReqWithUser;
        reqWithUser.__user = await currentUser(sess);

        res = await (routeLogic as ProtectedRouteLogic)(reqWithUser);
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

export default protectedRoute;
