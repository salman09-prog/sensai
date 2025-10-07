import { getUserOnboardingStatus } from "@/actions/user";
import { industries } from "@/data/industries";
import { redirect } from "next/navigation";
import OnboardingForm from "./_components/onboarding-form";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Loader2 } from "lucide-react";

const onboardingPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    // If somehow user isn't authenticated, send to sign-in
    redirect("/sign-in");
  }

  // Now check if user is onboarded
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect("/dashboard");
  }

  return (
    <main>
      <OnboardingForm industries={industries} />
    </main>
  );
};

export default onboardingPage;
