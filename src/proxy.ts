import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value; // 'customer', 'vendor', 'admin'
  const { pathname } = request.nextUrl;

  // 1. Unauthenticated Redirects
  if (!token) {
    // Customer route protection
    if (pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/onboarding/verification", request.url));
    }
    // Vendor route protection (ignore login/register/onboarding steps)
    if (pathname.startsWith("/vendor") && 
        pathname !== "/vendor/login" && 
        pathname !== "/vendor/register") {
      return NextResponse.redirect(new URL("/vendor/login", request.url));
    }
    // Admin route protection
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Authenticated Role-based access verification
  if (token) {
    // Redirect logged-in vendor away from login/register pages
    if (
      role === "vendor" &&
      (pathname === "/vendor/login" || pathname === "/vendor/register")
    ) {
      return NextResponse.redirect(new URL("/vendor/profile", request.url));
    }

    if (pathname.startsWith("/vendor") && 
        pathname !== "/vendor/login" && 
        pathname !== "/vendor/register" && 
        role !== "vendor") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/customer") && role !== "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer/:path*",
    "/vendor/:path*",
    "/admin/:path*",
  ],
};


