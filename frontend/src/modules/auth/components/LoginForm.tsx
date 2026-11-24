import { useNavigate } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import type { AuthResponse } from "@/core/auth/types";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Button } from "@/core/components/ui/Button";
import { authApi } from "../api/authApi";
import { type LoginInput, loginSchema } from "../schemas/authSchemas";
import { CodigoForm } from "./CodigoForm";

export function LoginForm() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	// Con 2FA, el primer paso devuelve un token intermedio y se pide el código.
	const [token2fa, setToken2fa] = useState<string | null>(null);

	const entrar = (response: AuthResponse) => {
		login(response);
		toast.success(`¡Bienvenido de nuevo, ${response.usuario.nombre}!`);
		navigate({ to: "/dashboard" });
	};

	const form = useAppForm({
		defaultValues: { email: "", password: "" } as LoginInput,
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			try {
				const response = await authApi.login(value);
				if ("requiere2fa" in response) setToken2fa(response.token2fa);
				else entrar(response);
			} catch (error: unknown) {
				toast.error(getErrorMessage(error));
			}
		},
	});

	if (token2fa) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-tinta-suave">
					Introduce el código de tu app de autenticación o uno de tus códigos de
					recuperación.
				</p>
				<CodigoForm
					textoBoton={
						<>
							<ShieldCheck className="h-4 w-4 mr-1.5" />
							Verificar
						</>
					}
					onEnviar={async (codigo) => {
						try {
							entrar(await authApi.loginDosFactores({ token2fa, codigo }));
						} catch (error: unknown) {
							toast.error(getErrorMessage(error));
						}
					}}
				/>
				<Button
					variant="ghost"
					size="sm"
					className="w-full"
					onClick={() => setToken2fa(null)}
				>
					Volver
				</Button>
			</div>
		);
	}

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="email">
					{(campo) => (
						<campo.CampoTexto
							label="Correo Electrónico"
							type="email"
							placeholder="usuario@ejemplo.com"
							autoComplete="email"
						/>
					)}
				</form.AppField>
				<form.AppField name="password">
					{(campo) => (
						<campo.CampoTexto
							label="Contraseña"
							type="password"
							placeholder="••••••••••••"
							autoComplete="current-password"
						/>
					)}
				</form.AppField>

				<form.BotonEnviar className="w-full mt-2" size="lg">
					<KeyRound className="h-4 w-4 mr-1.5" />
					Iniciar Sesión
				</form.BotonEnviar>

				{/* Solo en `pnpm dev`: Vite elimina este bloque del build de producción. */}
				{import.meta.env.DEV && (
					<div className="pt-4 border-t border-borde">
						<p className="text-xs text-tinta-tenue mb-2 font-medium">
							Credenciales de prueba del sistema:
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								// Usuario de `pnpm db:seed:demo`.
								form.setFieldValue("email", "admin@dev.com");
								form.setFieldValue("password", "SecurePass123!");
							}}
							className="w-full text-xs text-acento-tinta border-acento-borde hover:bg-acento-suave"
						>
							<Sparkles className="h-3.5 w-3.5 text-acento-tinta mr-1.5" />
							Rellenar como Administrador (admin@dev.com)
						</Button>
					</div>
				)}
			</form.Formulario>
		</form.AppForm>
	);
}
