"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId } = await auth();

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("User not found");

    try {
        const result = await db.$transaction(
            async (tx) => {
                // check if industry insight already exists
                let industryInsight = await tx.industryInsight.findUnique({
                    where: { industry: data.industry },
                });

                if (!industryInsight) {
                    const insights = await generateAIInsights(data.industry);


                    industryInsight = await db.industryInsight.create({
                        data: {
                            industry: data.industry,
                            ...insights,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        }
                    })

                }

                const updatedUser = await tx.user.update({
                    where: { id: user.id },
                    data: {
                        industry: data.industry,
                        experience: data.experience,
                        bio: data.bio,
                        skills: data.skills,
                    },
                });

                return { industryInsight, updatedUser };
            },
            { timeout: 10000 }
        );

        return { success: true, ...result }; // ✅ always return on success
    } catch (error) {
        console.error("Update user error:", error); // log it
        return { success: false, message: error.message }; // ✅ always return on failure
    }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user = null;
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 500; // 0.5 seconds

  // Retry up to 5 times, every 0.5s
  for (let i = 0; i < MAX_RETRIES; i++) {
    user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    if (user) break; // found user, stop retrying
    await new Promise((res) => setTimeout(res, RETRY_DELAY));
  }

  // If still no user after retries, throw error
  if (!user) throw new Error("User not found after retries");

  return {
    isOnboarded: !!user.industry,
  };
}
