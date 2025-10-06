import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/prisma";

// Clerk Webhook Endpoint
export async function POST(req) {
  const payload = await req.text();
  const hdrs = headers();

  const svix_id = (await hdrs).get("svix-id");
  const svix_timestamp = (await hdrs).get("svix-timestamp");
  const svix_signature = (await hdrs).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  const wh = new Webhook(webhookSecret);

  let evt;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  // 🧠 Handle user creation
  if (type === "user.created") {
    try {
      await db.user.create({
        data: {
          clerkUserId: data.id,
          email: data.email_addresses?.[0]?.email_address ?? null,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
        },
      });
      console.log(`✅ User created in DB for Clerk ID: ${data.id}`);
    } catch (error) {
      if (error.code === "P2002") {
        console.log("User already exists, skipping.");
      } else {
        console.error("Error creating user:", error);
      }
    }
  }

  // 🧠 Optional: handle deletion or update
  if (type === "user.deleted") {
    try {
      await db.user.delete({
        where: { clerkUserId: data.id },
      });
      console.log(`🗑️ Deleted user ${data.id} from DB`);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  return new Response("OK", { status: 200 });
}
