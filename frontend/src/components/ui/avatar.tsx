"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { DEFAULT_POKEMON_IMAGE, normalizePokemonImageSrc } from "@/lib/image-utils"

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
  sizes?: string
}

const AvatarImage = React.memo(function AvatarImage({
  src,
  alt,
  className,
  fallback = DEFAULT_POKEMON_IMAGE,
  sizes = "64px",
}: AvatarImageProps) {
  const [imgSrc, setImgSrc] = React.useState(() => normalizePokemonImageSrc(src))

  React.useEffect(() => {
    setImgSrc(normalizePokemonImageSrc(src))
  }, [src])

  return (
    <Image
      data-slot="avatar-image"
      src={imgSrc}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("aspect-square object-contain p-2", className)}
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
