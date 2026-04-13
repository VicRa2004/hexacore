import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number("El puerto debe ser un numero").default(3000),
  NODE_ENV: z.enum(["dev", "prod", "test"]).default("dev"),
});

const envPrev = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
};

export const env = EnvSchema.parse(envPrev);
