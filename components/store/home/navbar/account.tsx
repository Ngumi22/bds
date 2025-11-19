"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { SignInForm } from "@/app/(auth)/signin/_components/sign-in-form";
import { User } from "@/lib/auth";
import { UserDropdown } from "@/components/auth/user-dropdown";

export function Account({
  user,
  className = "h-5 w-5 text-current",
}: {
  user?: User;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (user) {
    return (
      <UserDropdown user={user}>
        <Avatar className={`cursor-pointer ${className}`}>
          <AvatarFallback className="bg-gray-100 text-gray-700 font-medium text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </UserDropdown>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <UserIcon className={className} strokeWidth={1.25} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogTitle />
        <SignInForm onUrlChange={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
