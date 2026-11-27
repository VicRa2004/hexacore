import { screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ajustesKeys } from "@/modules/ajustes/hooks/useAjustesQuery";
import { crearQueryClientDeTest, renderConQueryClient } from "@/test/utils";

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		className,
	}: {
		children: ReactNode;
		to: string;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
	useNavigate: () => vi.fn(),
}));

vi.mock("../components/BotonesOAuth", () => ({
	BotonesOAuth: () => <div data-testid="oauth-botones" />,
}));

import { LoginPage } from "./LoginPage";
import { RegistroPage } from "./RegistroPage";

describe("Aplicación de ajustes públicos en LoginPage y RegistroPage", () => {
	it("muestra el nombre personalizado y oculta el enlace de registro cuando está cerrado", () => {
		const queryClient = crearQueryClientDeTest();
		queryClient.setQueryData(ajustesKeys.publicos(), {
			nombreApp: "Acme Corp",
			colorMarca: 215,
			registroPublicoAbierto: false,
			logoUrl: "/api/ajustes/logo?v=1",
			faviconUrl: null,
		});

		renderConQueryClient(<LoginPage />, { queryClient });

		expect(
			screen.getByText("Ingresa tus credenciales para acceder a Acme Corp"),
		).toBeInTheDocument();
		expect(screen.getByAltText("Acme Corp")).toHaveAttribute(
			"src",
			"/api/ajustes/logo?v=1",
		);
		expect(screen.queryByText("Regístrate aquí")).not.toBeInTheDocument();
	});

	it("bloquea el formulario de RegistroPage cuando el registro público está cerrado", () => {
		const queryClient = crearQueryClientDeTest();
		queryClient.setQueryData(ajustesKeys.publicos(), {
			nombreApp: "Acme Corp",
			colorMarca: 215,
			registroPublicoAbierto: false,
			logoUrl: null,
			faviconUrl: null,
		});

		renderConQueryClient(<RegistroPage />, { queryClient });

		expect(
			screen.getByText(/El administrador ha cerrado el registro público/i),
		).toBeInTheDocument();
		expect(screen.queryByTestId("oauth-botones")).not.toBeInTheDocument();
		expect(screen.getByText("Inicia sesión")).toBeInTheDocument();
	});
});
