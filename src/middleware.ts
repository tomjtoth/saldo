import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const middleware = auth((req) => {
  if (req.nextUrl.pathname.startsWith("/api/e2e/")) {
    if (process.env.NODE_ENV === "production")
      return new Response(null, { status: 404 });
  } else if (!req.auth) {
    const loginUrl = new URL("/api/auth/signin", req.nextUrl.origin);

    // Preserve full path + query
    loginUrl.searchParams.set(
      "callbackUrl",
      req.nextUrl.pathname + req.nextUrl.search
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher:
    // TODO: could not split this into `[ ... ].join("|")`
    "/((?!api/auth/(?:sign(?:in|out)|callback/credentials)|_next/static|_next/image|.*\\.svg$|sw\\.js|manifest\\.webmanifest|favicon\\.ico|\\.well-known/appspecific/com\\.chrome\\.devtools\\.json).+)",
};
