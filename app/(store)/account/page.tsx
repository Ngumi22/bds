import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EmailForm } from "./email-form";
import { LogoutEverywhereButton } from "./logout-everywhere-button";
import { ProfileDetailsForm } from "./profile-details-form";
import { PasswordForm } from "./password-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  const loggedInUser = user;

  if (!loggedInUser) {
    redirect("/signin");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground">
            Update your account details, email, and password.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <ProfileDetailsForm user={loggedInUser} />
          </div>
          <div className="flex-1 space-y-6">
            <EmailForm currentEmail={loggedInUser.email} />
            <PasswordForm />
            <LogoutEverywhereButton />
          </div>
        </div>
      </div>
    </main>
  );
}
