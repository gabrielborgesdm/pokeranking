"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"

import { cn } from "@/lib/utils"

const BASE_AVATAR_URL = `/pokemon`;
const DEFAULT_AVATAR = `${BASE_AVATAR_URL}/pikachu.png`

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

interface AvatarImageProps {
  src: string
  alt: string
  className?: string
  fallback?: string
}

function normalizeImageSrc(src: string | undefined | null): string {
  if (!src) return DEFAULT_AVATAR
  if (src.startsWith("/") || src.startsWith("http")) return src
  return `${BASE_AVATAR_URL}/${src}`
}

const AvatarImage = React.memo(function AvatarImage({
  src,
  alt,
  className,
  fallback = DEFAULT_AVATAR,
}: AvatarImageProps) {
  const [imgSrc, setImgSrc] = React.useState(() => normalizeImageSrc(src))

  React.useEffect(() => {
    setImgSrc(normalizeImageSrc(src))
  }, [src])

  return (
    <Image
      data-slot="avatar-image"
      src={imgSrc}
      alt={alt}
      fill
      sizes="64px"
      className={cn("aspect-square object-cover", className)}
      onError={() => setImgSrc(fallback)}
    />
  )
})

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
