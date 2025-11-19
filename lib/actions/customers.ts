// actions/auth-actions.ts
"use server";

import { redirect } from "next/navigation";
import prisma from "../prisma";
import { signInSchema, signUpSchema } from "../schemas/auth";
import { auth } from "../auth";
import { z } from "zod";

export async function signUpCustomer(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phone: formData.get("phone") as string,
    };

    // Validate input with Zod
    const validatedData = signUpSchema.parse(rawData);

    // Use Better Auth to create user
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    // Check if signup was successful by looking for token
    if (!signUpResult.token) {
      return { error: "User creation failed. Please try again." };
    }

    // Create customer profile using your existing schema
    await prisma.customerProfile.create({
      data: {
        userId: signUpResult.user.id,
        phone: validatedData.phone || null,
        totalSpent: 0,
        orderCount: 0,
        lastOrderAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    redirect("/signin");
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]; // Fixed: use 'issues' instead of 'errors'
      return { error: firstError.message };
    }

    // Handle specific Better Auth errors
    if (error instanceof Error) {
      if (error.message.includes("User already exists")) {
        return { error: "An account with this email already exists." };
      }
    }

    return { error: "An unexpected error occurred during signup" };
  }
}

export async function signInCustomer(formData: FormData) {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const validatedData = signInSchema.parse(rawData);

    // Better Auth handles authentication
    const signInResult = await auth.api.signInEmail({
      body: {
        email: validatedData.email,
        password: validatedData.password,
      },
    });

    // Check if signin was successful by looking for token
    if (!signInResult.token) {
      return { error: "Invalid email or password." };
    }

    redirect("/account");
  } catch (error) {
    console.error("Signin error:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]; // Fixed: use 'issues' instead of 'errors'
      return { error: firstError.message };
    }

    // Handle specific Better Auth errors
    if (error instanceof Error) {
      if (error.message.includes("Invalid credentials")) {
        return { error: "Invalid email or password." };
      }
    }

    return { error: "An unexpected error occurred during signin" };
  }
}

export async function getCurrentUser() {
  try {
    const session = await auth.api.getSession({
      headers: {},
    });

    if (!session) {
      return null;
    }

    // Get full user data with customer profile using your existing schema
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProfile: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
