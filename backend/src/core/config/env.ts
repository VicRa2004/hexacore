import { z } from "zod";

/** Secretos de ejemplo del repo: nunca válidos en producción. */
const EXAMPLE_JWT_SECRETS = new Set([
	"supersecret_local_key_change_in_prod",
	"cambia_este_secreto_por_uno_de_32_caracteres_o_mas",
]);

const EnvSchema = z
	.object({
		PORT: z.coerce.number("El puerto debe ser un numero").default(3000),
		NODE_ENV: z.enum(["dev", "prod", "test"]).default("dev"),
		DATABASE_URL: z.url("DATABASE_URL debe ser una URL valida"),
		JWT_SECRET: z
			.string("JWT_SECRET es obligatorio")
			.min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
		// Orígenes permitidos por CORS, separados por comas.
		CORS_ORIGIN: z
			.string()
			.default("http://localhost:5173")
			.transform((value) => value.split(",").map((origin) => origin.trim())),
		// URL pública del frontend: base de los enlaces de los correos.
		APP_URL: z
			.url("APP_URL debe ser una URL valida")
			.default("http://localhost:5173")
			.transform((url) => url.replace(/\/$/, "")),
		// Sin RESEND_API_KEY los correos se escriben en consola (ConsoleMailer).
		RESEND_API_KEY: z.string().optional(),
		MAIL_FROM: z.string().default("Hexacore <no-reply@localhost>"),
		// Sin S3_BUCKET los archivos van a disco en STORAGE_DIR (LocalAlmacenamiento).
		STORAGE_DIR: z.string().default("uploads"),
		S3_BUCKET: z.string().optional(),
		S3_ENDPOINT: z.url().optional(),
		S3_REGION: z.string().optional(),
		S3_ACCESS_KEY_ID: z.string().optional(),
		S3_SECRET_ACCESS_KEY: z.string().optional(),
	})
	.refine(
		(env) =>
			env.NODE_ENV !== "prod" || !EXAMPLE_JWT_SECRETS.has(env.JWT_SECRET),
		{
			message: "JWT_SECRET de ejemplo: define uno propio en producción",
			path: ["JWT_SECRET"],
		},
	);

const envPrev = {
	PORT: process.env.PORT,
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_URL: process.env.DATABASE_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	CORS_ORIGIN: process.env.CORS_ORIGIN,
	APP_URL: process.env.APP_URL || undefined,
	RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
	MAIL_FROM: process.env.MAIL_FROM || undefined,
	STORAGE_DIR: process.env.STORAGE_DIR || undefined,
	S3_BUCKET: process.env.S3_BUCKET || undefined,
	S3_ENDPOINT: process.env.S3_ENDPOINT || undefined,
	S3_REGION: process.env.S3_REGION || undefined,
	S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || undefined,
	S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || undefined,
};

export const env = EnvSchema.parse(envPrev);
