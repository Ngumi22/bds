"use server";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "../auth";
import { redirect } from "next/navigation";

export async function handlePostSignInRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userRole = session?.user?.role;

  let defaultRedirectPath = "/";

  if (userRole === "ADMIN") {
    defaultRedirectPath = "/dashboard";
  } else if (userRole === "CUSTOMER") {
    defaultRedirectPath = "/account";
  }

  redirect(defaultRedirectPath);
}

export const getServerSession = cache(async () => {
  return await auth.api.getSession({ headers: await headers() });
});
