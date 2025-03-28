import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routeAccessMap } from "./lib/settings";
import { NextResponse } from "next/server";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

console.log(matchers);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();

  console.log(userId, req.nextUrl)
  // if (!userId && !req.nextUrl.pathname.includes('/signin') ) {
  //   console.log('is not loggedin')
  //     const loginUrl = new URL('/signin', req.nextUrl.origin)
  //     loginUrl.searchParams.set('from', req.url)
  //     return NextResponse.redirect(loginUrl)
  // }

  // if (userId) {
  //   const user = await (await clerkClient()).users.getUser(userId);
  //   const metadata = user.publicMetadata;
  
  //   for (const { matcher, allowedRoles } of matchers) {
  //     if (matcher(req) && !allowedRoles.includes(metadata?.role as any)) {
  //       return NextResponse.redirect(new URL('/home', req.nextUrl.origin));
  //     }
  //   }
  // }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
