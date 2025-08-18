import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { err, ErrorWithStatus } from "./utils";

export interface ReqWithUser extends NextRequest {
  __user: Awaited<ReturnType<typeof currentUser>>;
}

export default function protectedRoute(
  routeLogic: (req: ReqWithUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    try {
      const sess = await auth();
      if (!sess) err(401);
      (req as ReqWithUser).__user = await currentUser(sess);

      return await routeLogic(req as ReqWithUser);
    } catch (err: unknown) {
      return new Response(null, {
        status: (err as ErrorWithStatus).status ?? 400,
        statusText: (err as Error).message,
      });
    }
  };
}
