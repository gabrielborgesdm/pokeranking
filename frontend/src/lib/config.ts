import { z } from "zod";

// Server-side config (includes secrets)
const serverConfigSchema = z.object({
  apiUrl: z.string().url(),
  nextAuthSecret: z.string().min(1),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export function getServerConfig(): ServerConfig {
  const result = serverConfigSchema.safeParse({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
  });

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    console.error(`Invalid server configuration: ${missing}`);
    throw new Error(`Invalid server configuration: ${missing}`);
  }

  return result.data;
}

// Client-side config (only NEXT_PUBLIC_ vars)
const clientConfigSchema = z.object({
  apiUrl: z.string().url(),
  githubUrl: z.string().url().optional(),
  pixCode: z.string().optional(),
  allowedImageDomains: z.array(z.string()),
});

export type ClientConfig = z.infer<typeof clientConfigSchema>;

export function getClientConfig(): ClientConfig {
  const result = clientConfigSchema.safeParse({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || undefined,
    pixCode: process.env.NEXT_PUBLIC_PIX_CODE || undefined,
    allowedImageDomains: (
      process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS || "ik.imagekit.io"
    )
      .split(",")
      .map((d) => d.trim()),
  });

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    console.error(`Invalid client configuration: ${missing}`);
    throw new Error(`Invalid client configuration: ${missing}`);
  }

  return result.data;
}

// Legacy alias for backward compatibility
export const getConfig = getServerConfig;
export type Config = ServerConfig;
