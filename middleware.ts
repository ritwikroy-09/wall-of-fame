import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SECRET_KEY as ENV_SECRET_KEY } from './app/secrets';

const SECRET_KEY = new TextEncoder().encode(ENV_SECRET_KEY);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const token = req.cookies.get('token')?.value;

  // Pages that require authentication
  const protectedRoutes = ['/submit', '/dashboard', '/admin'];

  // Redirect helper
  const redirectToUnauthorized = (msg: string) => {
    const url = new URL('/unauthorized', req.url);
    url.searchParams.set('message', msg);
    url.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  };

  // Allow public pages
  if (!protectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Reject if no token
  if (!token) {
    return redirectToUnauthorized('No token found.');
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const email = String(payload.email || '').trim();

    if (!email.includes('@')) {
      return redirectToUnauthorized('Invalid token.');
    }

    const domain = email.split('@')[1];
    const username = email.split('@')[0];

    if (pathname === '/dashboard') {
      if (domain !== 'gmail.com') {
        return redirectToUnauthorized('Only Gmail users allowed on dashboard.');
      }
    }

    if (pathname === '/submit') {
      if (domain !== 'muj.manipal.edu') {
        return redirectToUnauthorized('Only MUJ students allowed to submit.');
      }
    }

    if (pathname === '/admin') {
      if (!['gmail.com', 'muj.manipal.edu'].includes(domain)) {
        return redirectToUnauthorized('Access restricted.');
      }

      const isAdmin = await checkAdminStatus(email, req);
      if (!isAdmin) {
        return redirectToUnauthorized('You are not an admin.');
      }
    }

    // Everything passed
    return NextResponse.next();

  } catch (err) {
    console.error('Token verification failed:', err);
    return redirectToUnauthorized('Invalid or expired token.');
  }
}

// Helper to call internal /api/auth/check-admin
async function checkAdminStatus(email: string, req: NextRequest): Promise<boolean> {
  try {
    const baseUrl = new URL(req.url).origin;
    const response = await fetch(`${baseUrl}/api/auth/check-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return data.isAdmin === true;
  } catch (error) {
    console.error('Admin check failed:', error);
    return false;
  }
}

// Match all except static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|unauthorized).*)',
  ],
};
