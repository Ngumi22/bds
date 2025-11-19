"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const adminSignUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "EDITOR", "SUPPORT"]),
});

export async function createAdminUser(formData: FormData) {
  try {
    const headerStore = await headers();
    const ipAddress = headerStore.get("x-forwarded-for") || "unknown";

    // 1. AUTHORIZATION: Only an existing Admin can use this tool
    const session = await auth.api.getSession({ headers: headerStore });
    if (!session || session.user.role !== "ADMIN") {
      console.warn(
        `⚠️ Unauthorized creation attempt by ${session?.user?.id} from ${ipAddress}`
      );
      return { error: "Unauthorized" };
    }

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as string,
    };

    const validationResult = adminSignUpSchema.safeParse(rawData);
    if (!validationResult.success) {
      return { error: validationResult.error.issues[0].message };
    }
    const { email, name, password, role } = validationResult.data;

    // 2. WHITELIST ENFORCEMENT (Defense in Depth)
    // Even an Admin cannot bypass the whitelist requirement
    if (!process.env.ADMIN_WHITELIST?.includes(email)) {
      return {
        error:
          "This email is not in the system whitelist for privileged access.",
      };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: "User already exists" };
    }

    // 3. Create User
    // NOTE: lib/auth.ts 'beforeCreate' hook will see the whitelist and auto-set role to ADMIN.
    // That's fine, because step #4 below will overwrite it with the specific role we want (e.g., EDITOR).
    const signUpResult = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (!signUpResult?.user) {
      return { error: "User creation failed" };
    }

    // 4. Assign Specific Role (Editor/Support)
    // We update the user to the specific role requested by the Admin
    const updatedUser = await prisma.user.update({
      where: { id: signUpResult.user.id },
      data: {
        role: role,
        emailVerified: true,
      },
    });

    await prisma.adminActivityLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_STAFF",
        resource: "User",
        details: {
          targetUser: updatedUser.id,
          assignedRole: role,
          email: email,
        },
        ipAddress: ipAddress,
      },
    });

    revalidatePath("/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("❌ Admin creation error:", error);
    return { error: "Failed to create user" };
  }
}
