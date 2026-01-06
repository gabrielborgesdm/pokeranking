import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

interface LogoProps {
  className?: string;
  size?: "default" | "large";
}

export function Logo({ className, size = "default" }: LogoProps) {
  const height = size === "large" ? 56 : 40;

  return (
    <Link href={routes.rankings} className={cn("flex shrink-0 items-center", className)}>
      <Image
        src='/images/logo.png'
        alt="Pokeranking"
        width={0}
        height={0}
        priority
        style={{ width: "auto", height: `${height}px` }}
        sizes="100vw"
        className="translate-y-[2px]"
      />
    </Link>
  );
}
