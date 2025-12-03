import { z } from "zod";

const configSchema = z.object({
  apiUrl: z.string().url(),
  nextAuthSecret: z.string().min(1),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  const result = configSchema.safeParse({
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
  });

  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Invalid environment configuration: ${missing}`);
  }

  return result.data;
}
