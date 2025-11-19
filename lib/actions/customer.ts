"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { env } from "@/lib/schemas/env.schema"; // Import your env schema

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUpWithProfile(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validatedData = signUpSchema.parse(rawData);
    const normalizedEmail = validatedData.email.toLowerCase();

    // 1. Check Whitelist directly here
    const isAdmin = env.ADMIN_WHITELIST.includes(normalizedEmail);

    // 2. Create the user (Default is CUSTOMER based on your auth.ts config)
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        // We cannot pass 'role' here because 'input: false' is set in auth.ts
      },
    });

    if (!signUpResult.token || !signUpResult.user) {
      return { error: "User creation failed" };
    }

    // 3. Handle Role & Profile Logic
    if (isAdmin) {
      // Force update to ADMIN
      await prisma.user.update({
        where: { id: signUpResult.user.id },
        data: {
          role: "ADMIN",
          // Optional: Auto-verify admins so they don't need email verification
          emailVerified: true,
        },
      });
      console.log(`Promoted ${normalizedEmail} to ADMIN`);
    } else {
      // Handle CUSTOMER logic
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId: signUpResult.user.id },
      });

      if (!customerProfile) {
        await prisma.customerProfile.create({
          data: {
            userId: signUpResult.user.id,
            phone: null,
            totalSpent: 0,
            orderCount: 0,
            lastOrderAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    return { success: true, user: signUpResult.user };
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }

    if (error instanceof Error) {
      // Better Auth throws APIError, checking message is a safe fallback
      if (
        error.message.includes("User already exists") ||
        error.message.includes("P2002")
      ) {
        return { error: "An account with this email already exists" };
      }
    }

    return { error: "An unexpected error occurred during signup" };
  }
}
