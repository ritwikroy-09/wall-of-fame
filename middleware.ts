import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SECRET_KEY as ENV_SECRET_KEY } from "./app/secrets";

const SECRET_KEY = new TextEncoder().encode(ENV_SECRET_KEY);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  let token = req.nextUrl.searchParams.get("token"); // Get token from URL

  if (pathname === "/") {
    console.log("Homepage accessed. No authentication required.");
    return NextResponse.next();
  }

  const redirectToUnauthorized = (msg: string) => {
    const url = new URL("/unauthorized", req.url);
    url.searchParams.set("message", msg);
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    console.log(`Redirecting to /unauthorized with message: ${msg}`);
    return NextResponse.redirect(url);
  };
  
  var email;
  if (['/submit', '/dashboard', '/admin'].includes(pathname)) {
    if (!token) {
      console.log("No token found. Redirecting to /unauthorized.");
      return redirectToUnauthorized("No token found.");
    }
    try {
      token = decodeURIComponent(token); // Decode in case it's URL-encoded
      const { payload } = await jwtVerify(token, SECRET_KEY);
      email = String(payload.email || "").trim();
      if (!email || !email.includes("@")) {
        console.log("Invalid email format in token. Redirecting to /unauthorized.");
        return redirectToUnauthorized("Invalid email format in token.");
      }
      const domain = email.split("@")[1];
      console.log(`Token Verified Successfully: Logged-in Email: ${email}`);
    } catch (error) {
      console.log("Invalid Token! Redirecting to /unauthorized.", error);
      return redirectToUnauthorized("Invalid token.");
    }
  }
  if (pathname === "/submit" || pathname === "/dashboard") {
    try {

      if (!email || !email.includes("@")) {
        console.log("Invalid email format in token. Redirecting to /unauthorized.");
        return redirectToUnauthorized("Invalid email format in token.");
      }

      const domain = email.split("@")[1];
      console.log(`Extracted mail: ${email}`);
      if (pathname === "/dashboard" && domain !== "gmail.com") {
        console.log("Unauthorized access attempt to dashboard. Redirecting.");
        return redirectToUnauthorized("Unauthorized access to dashboard.");
      }

      if (pathname === "/submit" && domain !== "muj.manipal.edu") {
        console.log("Unauthorized access attempt to submit page. Redirecting.");
        return redirectToUnauthorized("Unauthorized access to submit page.");
      }

      console.log(`Token Verified Successfully! Logged-in Email: ${email}`);
      console.log(`Extracted Domain: ${domain}`);

      return NextResponse.next(); // Allow access
    } catch (error) {
      console.log("Invalid Token! Redirecting to /unauthorized.", error);
      return redirectToUnauthorized("Invalid token.");
    }
  }

  if (pathname === "/admin") {
    try {
      const checkAdminStatus = async (email: string) => {
        try {
          const baseUrl = new URL(req.url).origin;
          const response = await fetch(`${baseUrl}/api/auth/check-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
          });
          const data = await response.json();
          return data.isAdmin;
        } catch (error) {
          console.error('Failed to check admin status:', error);
          return false;
        }
      };

      if (!email || !email.includes("@")) {
        console.log("Invalid email format in token. Redirecting to /unauthorized.");
        return redirectToUnauthorized("Invalid email format in token.");
      }
      const user = email.split("@")[0];
      const domain = email.split("@")[1];
      
      if (domain !== "gmail.com" && domain !== "muj.manipal.edu") {
        console.log("Unauthorized access attempt to admin page. Redirecting.");
        return redirectToUnauthorized("Unauthorized access to admin page.");
      }
      
      const isAdmin = await checkAdminStatus(email);
      if (!isAdmin) {
        console.log("Unauthorized access attempt to admin page. Redirecting.");
        return redirectToUnauthorized("User not authorized for admin access.");
      }

      console.log(`Token Verified Successfully! Logged-in Email: ${email}`);
      console.log(`Extracted Domain: ${domain}`);

      return NextResponse.next(); // Allow access
    } catch (error) {
      console.log("Invalid Token! Redirecting to /unauthorized.", error);
      return redirectToUnauthorized("Invalid token.");
    }
  }

  return NextResponse.next(); // Allow access to all other routes
}

export const config = {
  matcher: [
    "/((?!unauthorized|_next/static|_next/image|favicon.ico).*)", // Protect all pages, including domain-a-page and domain-b-page
  ],
};