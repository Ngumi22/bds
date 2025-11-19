"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UploadThingError } from "uploadthing/server";

async function getServerSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireAdmin() {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect("/signin");
  }

  if (session.user.role !== "ADMIN") {
    console.warn(
      "Unauthorized access attempt on admin route:",
      session.user.email
    );
    return redirect("/account");
  }

  return session;
}

export async function requireCustomer() {
  const session = await getServerSession();

  if (!session?.user) {
    return redirect("/signin");
  }

  if (session.user.role !== "CUSTOMER") {
    return redirect("/dashboard");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession();

  if (!session) {
    throw new UploadThingError("Unauthorized: No session.");
  }

  if (session.user.role !== "ADMIN") {
    throw new UploadThingError("Forbidden: Admins only.");
  }

  return session;
}

export async function isAdminAuth() {
  const session = await requireAdminSession();
  return { userId: session.user.id };
}
