import { z } from "zod";

const envSchema = z.object({
  DIRECT_DATABASE_URL: z
    .string()
    .url()
    .describe("Connection string for MongoDB/Postgres"),

  ADMIN_WHITELIST: z.string().transform((str) =>
    str
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0)
  ),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:");

  const formattedErrors = Object.entries(_env.error.format())
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}`;
      return null;
    })
    .filter(Boolean);

  formattedErrors.forEach((error) => console.error(`  - ${error}`));

  process.exit(1);
}

export const env = _env.data;
