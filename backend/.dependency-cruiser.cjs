/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
	forbidden: [
		// 1. Domain → Infrastructure ❌
		{
			name: "domain-not-to-infrastructure",
			severity: "error",
			comment:
				"La capa de Dominio no debe depender de la capa de Infraestructura.",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "(^|/)infrastructure/",
			},
		},

		// 2. Domain → Application ❌
		{
			name: "domain-not-to-application",
			severity: "error",
			comment: "La capa de Dominio no debe depender de la capa de Aplicación.",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "(^|/)application/",
			},
		},

		// 3. Application → Infrastructure ❌
		{
			name: "application-not-to-infrastructure",
			severity: "error",
			comment:
				"La capa de Aplicación no debe depender de la capa de Infraestructura.",
			from: {
				path: "(^|/)application/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "(^|/)infrastructure/",
			},
		},

		// 4. Dependencias circulares ❌
		{
			name: "no-circular",
			severity: "error",
			comment: "No se permiten dependencias circulares en el código.",
			from: {},
			to: {
				circular: true,
			},
		},

		// 5. Módulo A → internals Módulo B ❌
		{
			name: "no-cross-module-internals",
			severity: "error",
			comment:
				"Un módulo no debe acceder a los detalles internos de otro módulo (debe acceder solo a través de su punto de entrada público index.ts o contratos de core/shared).",
			from: {
				path: "^src/(?:modules|core)/([^/]+)/.+",
				pathNot: ["^src/core/(?:shared|config)/.+", "\\.(spec|test)\\.ts$"],
			},
			to: {
				path: "^src/(?:modules|core)/([^/]+)/.+",
				pathNot: [
					"^src/(?:modules|core)/$1/.+", // Mismo módulo permitido
					"^src/core/(?:shared|config)/.+", // Núcleo compartido / config permitido
					"^src/(?:modules|core)/[^/]+/index\\.ts$", // Punto de entrada público permitido
				],
			},
		},

		// --- Política de librerías en domain/ y application/ ---

		// domain/ ├── Node framework APIs ❌
		{
			name: "domain-no-node-framework-apis",
			severity: "error",
			comment:
				"La capa de Dominio no debe depender de APIs de I/O o del servidor de Node/Bun (fs, http, net, child_process, etc.).",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(node:(?!crypto|util)|fs|http|https|net|child_process|cluster|dgram|dns|tls|v8|vm|wasi|worker_threads)",
			},
		},

		// domain/ ├── Hono ❌
		{
			name: "domain-no-hono",
			severity: "error",
			comment: "La capa de Dominio no debe depender del framework web Hono.",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(@?hono|@scalar/hono-api-reference)",
			},
		},

		// domain/ ├── Prisma & DB ❌
		{
			name: "domain-no-prisma",
			severity: "error",
			comment:
				"La capa de Dominio no debe depender del ORM Prisma, modelos generados ni del cliente de base de datos.",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(@prisma/|prisma$|@prisma/adapter-pg$)|(^|/)(?:src/)?generated/prisma|(^|/)(?:src/)?core/config/prisma",
			},
		},

		// domain/ ├── HTTP ❌
		{
			name: "domain-no-http",
			severity: "error",
			comment:
				"La capa de Dominio no debe depender de librerías HTTP o frameworks web.",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(hono|@hono/|express|express-rate-limit|cookie-parser|supertest|axios|node:http|node:https|^http$|^https$)|(^|/)(?:src/)?core/config/(?:openapi|swagger)",
			},
		},

		// domain/ ├── DB Drivers ❌
		{
			name: "domain-no-db",
			severity: "error",
			comment:
				"La capa de Dominio no debe depender de conectores o drivers de bases de datos.",
			from: {
				path: "(^|/)domain/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(pg|@types/pg|@prisma/|prisma$|@prisma/adapter-pg)|(^|/)(?:src/)?generated/prisma|(^|/)(?:src/)?core/config/prisma",
			},
		},

		// application/ ├── Node framework APIs ❌
		{
			name: "application-no-node-framework-apis",
			severity: "error",
			comment:
				"La capa de Aplicación no debe depender de APIs de I/O o del servidor de Node/Bun (fs, http, net, child_process, etc.).",
			from: {
				path: "(^|/)application/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(node:(?!crypto|util)|fs|http|https|net|child_process|cluster|dgram|dns|tls|v8|vm|wasi|worker_threads)",
			},
		},

		// application/ ├── Hono ❌
		{
			name: "application-no-hono",
			severity: "error",
			comment: "La capa de Aplicación no debe depender del framework web Hono.",
			from: {
				path: "(^|/)application/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(@?hono|@scalar/hono-api-reference)",
			},
		},

		// application/ ├── Prisma & DB ❌
		{
			name: "application-no-prisma",
			severity: "error",
			comment:
				"La capa de Aplicación no debe depender directamente del ORM Prisma, modelos generados ni cliente de base de datos (debe usar repositorios/puertos).",
			from: {
				path: "(^|/)application/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(@prisma/|prisma$|@prisma/adapter-pg$)|(^|/)(?:src/)?generated/prisma|(^|/)(?:src/)?core/config/prisma",
			},
		},

		// application/ ├── HTTP ❌
		{
			name: "application-no-http",
			severity: "error",
			comment:
				"La capa de Aplicación no debe depender de librerías HTTP o frameworks web.",
			from: {
				path: "(^|/)application/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(hono|@hono/|express|express-rate-limit|cookie-parser|supertest|axios|node:http|node:https|^http$|^https$)|(^|/)(?:src/)?core/config/(?:openapi|swagger)",
			},
		},

		// application/ ├── DB Drivers ❌
		{
			name: "application-no-db",
			severity: "error",
			comment:
				"La capa de Aplicación no debe depender de conectores o drivers de bases de datos.",
			from: {
				path: "(^|/)application/",
				pathNot: "\\.(spec|test)\\.ts$",
			},
			to: {
				path: "^(pg|@types/pg|@prisma/|prisma$|@prisma/adapter-pg)|(^|/)(?:src/)?generated/prisma|(^|/)(?:src/)?core/config/prisma",
			},
		},
	],
	options: {
		doNotFollow: {
			path: ["node_modules", "^src/generated"],
		},
		// TS 7 no expone la API de compilador que usa depcruise; swc la sustituye.
		parser: "swc",
		tsPreCompilationDeps: true,
		tsConfig: {
			fileName: "tsconfig.json",
		},
		enhancedResolveOptions: {
			exportsFields: ["exports"],
			conditionNames: ["import", "require", "node", "default"],
		},
		reporterOptions: {
			text: {
				highlightFocused: true,
			},
		},
	},
};
