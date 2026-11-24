import { expect, test } from "@playwright/test";
import { cerrarSesion, iniciarSesion } from "./helpers";

test.describe("Permisos por rol y rutas protegidas (E2E)", () => {
	test("debería reflejar en la UI los cambios de permisos de un rol y mostrar Sin acceso en rutas protegidas", async ({
		page,
	}) => {
		// 1. El administrador quita `usuarios:crear` al rol MOD
		await iniciarSesion(page, "admin@dev.com");
		await page
			.getByRole("navigation", { name: "Principal" })
			.getByRole("link", { name: "Roles" })
			.click();
		await expect(page).toHaveURL(/\/roles/);

		await page
			.getByRole("navigation", { name: "Roles" })
			.getByRole("button", { name: /MOD/ })
			.click();

		const casillaCrearUsuario = page.getByRole("checkbox", {
			name: "usuarios:crear",
		});
		await expect(casillaCrearUsuario).toBeChecked();
		await casillaCrearUsuario.uncheck();

		const botonGuardar = page.getByRole("button", { name: "Guardar" });
		await botonGuardar.click();
		await expect(botonGuardar).toBeDisabled();

		// 2. El usuario MOD inicia sesión y ve la interfaz adaptada a sus permisos
		await cerrarSesion(page);
		await iniciarSesion(page, "mod@dev.com");

		const sidebar = page.getByRole("navigation", { name: "Principal" });
		await expect(sidebar.getByRole("link", { name: "Usuarios" })).toBeVisible();
		await expect(sidebar.getByRole("link", { name: "Roles" })).toHaveCount(0);
		await expect(sidebar.getByRole("link", { name: "Auditoría" })).toHaveCount(
			0,
		);

		await sidebar.getByRole("link", { name: "Usuarios" }).click();
		await expect(page).toHaveURL(/\/usuarios/);
		await expect(page.getByRole("table", { name: "Usuarios" })).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Nuevo usuario" }),
		).toHaveCount(0);

		// 3. Acceso directo por URL a rutas sin permiso muestra «Sin acceso»
		await page.goto("/roles");
		await expect(
			page.getByRole("heading", { name: "Sin acceso" }),
		).toBeVisible();
		await expect(page.getByText("roles:leer")).toBeVisible();

		await page.goto("/auditoria");
		await expect(
			page.getByRole("heading", { name: "Sin acceso" }),
		).toBeVisible();
		await expect(page.getByText("auditoria:leer")).toBeVisible();
	});
});
