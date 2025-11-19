import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href={"/"} prefetch={true} className="flex items-center h-16">
      <Image
        src="/logo.svg"
        alt="Bernzz Logo"
        width={100}
        height={100}
        className="w-32 md:w-40 lg:w-48"
        priority
      />
    </Link>
  );
}
