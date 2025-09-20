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

    console.log("userId before dashboard :-", userId);

    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        }
    })

    console.log("user before dashboard :-", user);
    if (!user) throw new Error("User not found");

    try {
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true
            }
        });

        return {
            isOnboarded: !!user?.industry,
        };

    } catch (error) {
        console.error("Error checking onboarding status", error.message);
        throw new Error("Failed to check onboarding status");
    }

}