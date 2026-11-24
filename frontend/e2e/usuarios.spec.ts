import { expect, test } from "@playwright/test";
import { iniciarSesion } from "./helpers";

const EMAIL_NUEVO = "e2e.usuario@test.dev";

test.describe("Gestión de usuarios (E2E)", () => {
	test("debería permitir iniciar sesión, crear, editar, desactivar y eliminar un usuario", async ({
		page,
	}) => {
		await iniciarSesion(page, "admin@dev.com");

		await page
			.getByRole("navigation", { name: "Principal" })
			.getByRole("link", { name: "Usuarios" })
			.click();
		await expect(page).toHaveURL(/\/usuarios/);

		// Alta de usuario
		await page.getByRole("button", { name: "Nuevo usuario" }).click();
		const dialogoCrear = page.getByRole("dialog");
		await expect(dialogoCrear).toBeVisible();
		await dialogoCrear.getByLabel("Nombre completo").fill("Usuario E2E");
		await dialogoCrear.getByLabel("Correo electrónico").fill(EMAIL_NUEVO);
		await dialogoCrear
			.getByLabel("Contraseña", { exact: true })
			.fill("SecurePass123!");
		await dialogoCrear.getByRole("button", { name: "Crear usuario" }).click();
		await expect(dialogoCrear).toBeHidden();

		// Búsqueda por email para aislar la fila en la primera página
		await page.getByLabel("Buscar por email").fill(EMAIL_NUEVO);
		const fila = page.getByRole("row", { name: /e2e\.usuario@test\.dev/ });
		await expect(fila).toBeVisible();
		await expect(fila).toContainText("Usuario E2E");
		await expect(fila).toContainText("Activo");

		// Edición de usuario
		await fila
			.getByRole("button", { name: "Más acciones para Usuario E2E" })
			.click();
		await fila.getByRole("button", { name: "Editar" }).click();
		const dialogoEditar = page.getByRole("dialog");
		await expect(dialogoEditar).toBeVisible();
		const inputNombre = dialogoEditar.getByLabel("Nombre completo");
		await inputNombre.clear();
		await inputNombre.fill("Usuario E2E Editado");
		await dialogoEditar
			.getByRole("button", { name: "Guardar cambios" })
			.click();
		await expect(dialogoEditar).toBeHidden();
		await expect(fila).toContainText("Usuario E2E Editado");

		// Desactivación con diálogo de confirmación
		await fila
			.getByRole("button", { name: "Más acciones para Usuario E2E Editado" })
			.click();
		await fila.getByRole("button", { name: "Desactivar" }).click();
		const dialogoDesactivar = page.getByRole("dialog");
		await expect(dialogoDesactivar).toBeVisible();
		await dialogoDesactivar.getByRole("button", { name: "Desactivar" }).click();
		await expect(dialogoDesactivar).toBeHidden();
		await expect(fila).toContainText("Inactivo");

		// Eliminación con diálogo de confirmación
		await fila
			.getByRole("button", { name: "Más acciones para Usuario E2E Editado" })
			.click();
		await fila.getByRole("button", { name: "Eliminar" }).click();
		const dialogoEliminar = page.getByRole("dialog");
		await expect(dialogoEliminar).toBeVisible();
		await dialogoEliminar.getByRole("button", { name: "Eliminar" }).click();
		await expect(dialogoEliminar).toBeHidden();
		await expect(fila).toHaveCount(0);
	});
});
