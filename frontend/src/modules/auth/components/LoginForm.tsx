import { useNavigate } from "@tanstack/react-router";
import { KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Button } from "@/core/components/ui/Button";
import { authApi } from "../api/authApi";
import { type LoginInput, loginSchema } from "../schemas/authSchemas";

export function LoginForm() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);

	const form = useAppForm({
		defaultValues: { email: "", password: "" } as LoginInput,
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			try {
				const response = await authApi.login(value);
				login(response);
				toast.success(`¡Bienvenido de nuevo, ${response.usuario.nombre}!`);
				navigate({ to: "/dashboard" });
			} catch (error: unknown) {
				toast.error(getErrorMessage(error));
			}
		},
	});

	const rellenarDemoAdmin = () => {
		form.setFieldValue("email", "admin@dev.com");
		form.setFieldValue("password", "SecurePass123!");
	};

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

				<div className="pt-4 border-t border-borde">
					<p className="text-xs text-tinta-tenue mb-2 font-medium">
						Credenciales de prueba del sistema:
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={rellenarDemoAdmin}
						className="w-full text-xs text-indigo-300 border-indigo-900/50 hover:bg-indigo-950/40"
					>
						<Sparkles className="h-3.5 w-3.5 text-indigo-400 mr-1.5" />
						Rellenar como Administrador (admin@dev.com)
					</Button>
				</div>
			</form.Formulario>
		</form.AppForm>
	);
}
