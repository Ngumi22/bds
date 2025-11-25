"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { env } from "@/lib/schemas/env.schema";

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

    const isAdmin = env.ADMIN_WHITELIST.includes(normalizedEmail);

    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    if (!signUpResult.token || !signUpResult.user) {
      return { error: "User creation failed" };
    }

    if (isAdmin) {
      await prisma.user.update({
        where: { id: signUpResult.user.id },
        data: {
          role: "ADMIN",
          emailVerified: true,
        },
      });
      console.log(`Promoted ${normalizedEmail} to ADMIN`);
    } else {
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
