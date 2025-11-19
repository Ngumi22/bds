"use client";

import { User } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  user: User;
  children?: React.ReactNode;
}

export function UserDropdown({ user, children }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="outline">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={16}
                height={16}
                className="rounded-full object-cover"
              />
            ) : (
              <UserIcon />
            )}
            <span className="max-w-48 truncate">{user.name}</span>
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">
            <UserIcon className="size-4" /> <span>Your Account</span>
          </Link>
        </DropdownMenuItem>
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignOutItem() {
  const router = useRouter();
  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message || "Something went wrong");
    } else {
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    }
  }
  return (
    <DropdownMenuItem onClick={handleSignOut}>
      <LogOutIcon className="size-4" /> <span>Sign out</span>
    </DropdownMenuItem>
  );
}
