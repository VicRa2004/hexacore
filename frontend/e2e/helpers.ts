import { expect, type Page } from "@playwright/test";

export const PASSWORD_DEMO = "SecurePass123!";

export async function iniciarSesion(
	page: Page,
	email: string,
	password = PASSWORD_DEMO,
): Promise<void> {
	await page.goto("/login");
	await page.getByLabel("Correo Electrónico").fill(email);
	await page.getByLabel("Contraseña", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Iniciar Sesión" }).click();
	await expect(page).toHaveURL(/\/dashboard/);
}

export async function cerrarSesion(page: Page): Promise<void> {
	await page.getByRole("button", { name: "Menú de la cuenta" }).click();
	await page.getByRole("button", { name: "Cerrar sesión" }).click();
	await expect(page).toHaveURL(/\/login/);
}
