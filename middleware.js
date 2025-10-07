import { auth, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // <-- add this

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const url = req.nextUrl;

  // 1️⃣ Redirect unauthenticated users
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  // 2️⃣ Wait for Clerk webhook to sync user into DB before allowing onboarding
  if (url.pathname.startsWith("/onboarding")) {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // If user not found, retry a few times before redirecting
    if (!user) {
      console.log("User not found in DB yet. Waiting for Clerk webhook…");

      // Wait up to ~2.5 seconds total
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 500));
        const retryUser = await db.user.findUnique({
          where: { clerkUserId: userId },
        });
        if (retryUser) break;
      }

      // Final check after retries
      const finalUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });

      // Still not found after waiting? Redirect them to / (home)
      if (!finalUser) {
        console.warn("User never appeared in DB after waiting.");
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  // 3️⃣ Default
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
