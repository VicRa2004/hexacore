import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number("El puerto debe ser un numero").default(3000),
});

const envPrev = {
  PORT: process.env.PORT,
};

export const env = EnvSchema.parse(envPrev);
