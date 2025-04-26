import { NextResponse } from "next/server";

// Regex for static assets
const STATIC_ASSETS =
  /\.(?:jpg|jpeg|gif|png|svg|ico|webp|woff|woff2|ttf|otf|css|js)$/;

export function middleware(request) {
  const response = NextResponse.next();
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle static assets
  if (STATIC_ASSETS.test(request.nextUrl.pathname)) {
    if (isDevelopment && request.nextUrl.pathname.endsWith(".css")) {
      // Prevent caching of CSS in development
      response.headers.set("Cache-Control", "no-store, must-revalidate");
    } else {
      // Cache other static assets and CSS in production
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }
    return response;
  }

  // Cache HTML pages
  if (request.nextUrl.pathname === "/") {
    response.headers.set(
      "Cache-Control",
      isDevelopment
        ? "no-store"
        : "public, s-maxage=60, stale-while-revalidate=59"
    );
  }

  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|_vercel/insights).*)",
  ],
};
