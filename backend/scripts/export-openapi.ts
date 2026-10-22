// Escribe el spec OpenAPI en un archivo sin levantar el servidor ni conectar a la BD.
// Uso: bun scripts/export-openapi.ts <salida.json>
import "reflect-metadata";

const output = process.argv[2];
if (!output) {
	console.error("Uso: bun scripts/export-openapi.ts <salida.json>");
	process.exit(1);
}

// Valores fijos para que el spec sea determinista (servers usa PORT) y no
// dependa del .env local; Prisma no conecta hasta la primera consulta.
process.env.PORT = "3000";
process.env.DATABASE_URL ??=
	"postgresql://openapi:openapi@localhost:5432/openapi";
process.env.JWT_SECRET ??= "openapi_export_secret_de_32_caracteres_x";

const { app } = await import("@/core/shared/infrastructure/http/server");
const { openApiConfig } = await import("@/core/config/openapi");

await Bun.write(output, JSON.stringify(app.getOpenAPIDocument(openApiConfig)));
process.exit(0);
