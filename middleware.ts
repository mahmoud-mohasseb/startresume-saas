import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/templates",
  "/linkedin-optimization",
  "/pricing",
  "/faq",
  "/help",
  "/blog",
  "/examples",
  "/api/health"
]);

const isIgnoredRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/_next(.*)",
  "/favicon.ico",
  "/logo.svg",
  "/manifest.json",
  "/apple-touch-icon.png",
  "/icon-192x192.png",
  "/api/health"
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // Skip ignored routes
  if (isIgnoredRoute(req)) {
    return NextResponse.next();
  }

  // Handle large headers and optimize requests
  const headerSize = JSON.stringify(Object.fromEntries(req.headers.entries())).length;
  
  if (headerSize > 8192) { // 8KB limit
    // Only log in production or when headers are extremely large
    if (process.env.NODE_ENV === 'production' || headerSize > 12288) {
      console.warn(`Large headers detected: ${headerSize} bytes`);
    }
    
    const response = NextResponse.next();
    
    // Remove potentially large headers that aren't needed
    const headersToRemove = [
      'x-forwarded-for',
      'x-forwarded-host', 
      'x-forwarded-proto',
      'x-real-ip',
      'cf-ray',
      'cf-connecting-ip'
    ];
    
    headersToRemove.forEach(header => {
      if (req.headers.has(header)) {
        response.headers.delete(header);
      }
    });
  }

  // Handle large request payloads
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return new NextResponse('Request too large', { status: 413 });
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    auth().protect();
  }

  // Redirect authenticated users away from auth pages
  const { userId } = auth();
  if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    // Check if there's a redirect URL in the query params
    const redirectUrl = req.nextUrl.searchParams.get('redirect_url');
    if (redirectUrl) {
      // Redirect to the intended destination
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    // Default redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
