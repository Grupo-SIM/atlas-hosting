import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


// https://github.com/vercel/next.js/discussions/55037#discussioncomment-12454718
export function middleware(request: NextRequest) {
  // Clone the request headers so that we don't modify the original headers object
  const requestHeaders = new Headers(request.headers);

  // Check if the hosting platform provides the client's IP address and store it in a variable
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "";
  const userAgent = request.headers.get("user-agent") || "";

  // Set the IP and user agent headers into request to be used in the action
  requestHeaders.set("x-forwarded-for", ip);
  requestHeaders.set("user-agent", userAgent);
  
  // Set the current pathname for redirect purposes
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
