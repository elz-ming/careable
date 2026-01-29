import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes: Landing page, Authentication, and Webhooks
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhooks(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  let role = (sessionClaims?.metadata as any)?.role || (sessionClaims as any)?.app_role;

  // FALLBACK: If user is logged in but role is missing from token, 
  // fetch it directly from Clerk to bypass JWT caching.
  if (userId && !role) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata.role as string;
    console.log(`[Middleware Fallback] Fresh Role Fetch: ${role || 'None'}`);
  }

  console.log(`[Middleware] Path: ${req.nextUrl.pathname} | User: ${userId} | Role: ${role || 'None'}`);

  // 1. If not logged in and trying to access a protected route, redirect to Sign-In
  if (!userId && !isPublicRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  // 2. Handle logic for authenticated users
  if (userId) {
    // FIX: Remove 'const' here so we use the 'role' variable from the fallback above
    role = role || (sessionClaims?.metadata as any)?.role || (sessionClaims as any)?.app_role;

    // A. Force Onboarding if no role is assigned
    if (!role && !isOnboardingRoute(req)) {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // B. Redirect to appropriate dashboard based on role
    if (role) {
      // Portal roles (volunteer, caregiver, participant) use unified routes WITHOUT /portal/ prefix
      const portalRoles = ['volunteer', 'caregiver', 'participant'];
      const dashboardPath = portalRoles.includes(role) 
        ? '/dashboard' 
        : `/${role}/dashboard`;
      
      // Redirect from landing, auth, or onboarding pages to the correct dashboard
      const shouldRedirectToDashboard = 
        req.nextUrl.pathname === "/" || 
        isPublicRoute(req) || 
        isOnboardingRoute(req);

      if (shouldRedirectToDashboard) {
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }

      // C. Cross-role protection: Ensure user only accesses their own route group
      const roles = ['admin', 'staff'];
      const currentPathRole = roles.find(r => req.nextUrl.pathname.startsWith(`/${r}`));
      
      // Redirect if trying to access wrong admin/staff dashboard
      if (currentPathRole && currentPathRole !== role) {
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }
      
      // Redirect portal roles trying to access old route structure
      if (portalRoles.includes(role)) {
        const oldPortalPaths = ['/volunteer/', '/participant/', '/caregiver/', '/portal/'];
        const isOldPortalPath = oldPortalPaths.some(path => req.nextUrl.pathname.startsWith(path));
        
        if (isOldPortalPath) {
          // Map old paths to new unified routes (without /portal/ prefix)
          const newPath = req.nextUrl.pathname
            .replace(/^\/(volunteer|participant|caregiver|portal)\//, '/');
          return NextResponse.redirect(new URL(newPath, req.url));
        }
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
