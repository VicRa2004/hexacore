import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderConQueryClient } from "@/test/utils";

const { proveedoresMock, urlMock } = vi.hoisted(() => ({
	proveedoresMock: vi.fn(),
	urlMock: vi.fn(),
}));

vi.mock("../api/authApi", () => ({
	authApi: { proveedoresOAuth: proveedoresMock, urlOAuth: urlMock },
}));

import { BotonesOAuth } from "./BotonesOAuth";

describe("BotonesOAuth", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("no muestra nada si no hay proveedores configurados", async () => {
		proveedoresMock.mockResolvedValue([]);
		const { container } = renderConQueryClient(<BotonesOAuth />);
		await waitFor(() => expect(proveedoresMock).toHaveBeenCalled());
		expect(container).toBeEmptyDOMElement();
	});

	it("navega a la URL del proveedor elegido", async () => {
		const assign = vi.fn();
		vi.stubGlobal("location", { ...window.location, assign });
		proveedoresMock.mockResolvedValue(["google", "github"]);
		urlMock.mockResolvedValue("https://github.com/login/oauth/authorize?x=1");

		renderConQueryClient(<BotonesOAuth />);
		await userEvent.click(
			await screen.findByRole("button", { name: "GitHub" }),
		);

		await waitFor(() =>
			expect(assign).toHaveBeenCalledWith(
				"https://github.com/login/oauth/authorize?x=1",
			),
		);
		expect(urlMock).toHaveBeenCalledWith("github", "iniciar");
	});
});
