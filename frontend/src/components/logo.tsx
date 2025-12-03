import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center", className)}>
      <Image
        src="/images/pokeranking.png"
        alt="Pokeranking"
        width={142}
        height={40}
        style={{ width: "auto", height: "40px" }}
        className="translate-y-[2px]"
      />
    </Link>
  );
}
