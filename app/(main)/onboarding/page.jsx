import { redirect } from "next/navigation";
import OnboardingForm from "./_components/onboarding-form";
import { industries } from "@/data/industries";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const OnboardingPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // ✅ Wait for user to appear in DB (retry up to 5 times)
  let dbUser = null;
  for (let i = 0; i < 5; i++) {
    dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (dbUser) break;
    await new Promise((res) => setTimeout(res, 500)); // wait 0.5s
  }

  // ❌ If user still not found after retries
  if (!dbUser) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Setting up your account...</div>
      </main>
    );
  }

  // ✅ Redirect onboarded users
  if (dbUser.industry) {
    redirect("/dashboard");
  }

  // ✅ Otherwise, render onboarding form
  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
};

export default OnboardingPage;
