import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { SECRET_KEY as ENV_SECRET_KEY } from "./app/secrets";

const SECRET_KEY = new TextEncoder().encode(ENV_SECRET_KEY);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  let token = req.cookies.get("token")?.value;

  const redirectToUnauthorized = (msg: string) => {
    const url = new URL("/unauthorized", req.url);
    url.searchParams.set("message", msg);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    console.log(`Redirecting to /unauthorized with message: ${msg}`);
    return NextResponse.redirect(url);
  };

  // Allow homepage access freely
  if (pathname === "/") {
    console.log("Homepage accessed. No authentication required.");
    return NextResponse.next();
  }

  // Inject token dynamically in production (for testing/demo only)
  if (!token && process.env.NODE_ENV === 'production') {
    console.log("Token not found. Injecting fallback token for production.");
    token = encodeURIComponent(
      await new SignJWT({ email: "ritwikroy2002@gmail.com" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("5m")
        .sign(SECRET_KEY)
    );
    req.nextUrl.searchParams.set("token", token);
    return NextResponse.redirect(req.nextUrl); // Force reload with token
  }

  let email = "";

  // Protected Routes
  if (["/submit", "/dashboard", "/admin"].includes(pathname)) {
    if (!token) {
      console.log("No token found. Redirecting to /unauthorized.");
      return redirectToUnauthorized("No token found.");
    }

    try {
      token = decodeURIComponent(token); // decode fallback token if needed
      const { payload } = await jwtVerify(token, SECRET_KEY);
      email = String(payload.email || "").trim();

      if (!email || !email.includes("@")) {
        console.log("Invalid email format in token.");
        return redirectToUnauthorized("Invalid email format in token.");
      }

      console.log(`Token Verified: ${email}`);
    } catch (error) {
      console.log("JWT verification failed.");
      return redirectToUnauthorized("Invalid or expired token.");
    }
  }

  if (pathname === "/submit" || pathname === "/dashboard") {
    const domain = email.split("@")[1];
    console.log(`Domain check: ${domain} for route ${pathname}`);

    if (pathname === "/dashboard" && domain !== "gmail.com") {
      return redirectToUnauthorized("Only Gmail users allowed on dashboard.");
    }

    if (pathname === "/submit" && domain !== "muj.manipal.edu") {
      return redirectToUnauthorized("Only MUJ users allowed on submit page.");
    }

    return NextResponse.next();
  }

  if (pathname === "/admin") {
    const checkAdminStatus = async (email: string) => {
      try {
        const baseUrl = new URL(req.url).origin;
        const response = await fetch(`${baseUrl}/api/auth/check-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        return data.isAdmin;
      } catch (error) {
        console.error("Admin check failed:", error);
        return false;
      }
    };

    const domain = email.split("@")[1];

    if (domain !== "gmail.com" && domain !== "muj.manipal.edu") {
      return redirectToUnauthorized("Only MUJ/Gmail users allowed on admin.");
    }

    const isAdmin = await checkAdminStatus(email);
    if (!isAdmin) {
      return redirectToUnauthorized("You are not authorized as admin.");
    }

    return NextResponse.next();
  }

  return NextResponse.next(); // allow other paths
}

export const config = {
  matcher: [
    "/((?!unauthorized|_next/static|_next/image|favicon.ico).*)",
  ],
};
