import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";

export interface ReqWithUser extends NextRequest {
  __user: Awaited<ReturnType<typeof currentUser>>;
}

export default function protectedRoute(
  routeLogic: (req: ReqWithUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const sess = await auth();
    if (!sess) return new Response(null, { status: 401 });
    (req as ReqWithUser).__user = await currentUser(sess);

    try {
      return await routeLogic(req as ReqWithUser);
    } catch (err: unknown) {
      return new Response(null, {
        status: 400,
        statusText: (err as Error).message,
      });
    }
  };
}
