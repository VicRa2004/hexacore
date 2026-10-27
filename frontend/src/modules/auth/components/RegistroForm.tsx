import { useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import { useAppForm } from "@/core/components/form/useAppForm";
import { authApi } from "../api/authApi";
import { type RegistroInput, registroSchema } from "../schemas/authSchemas";

export function RegistroForm() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);

	const form = useAppForm({
		defaultValues: { nombre: "", email: "", password: "" } as RegistroInput,
		validators: { onChange: registroSchema },
		onSubmit: async ({ value }) => {
			try {
				const response = await authApi.registro(value);
				login(response);
				toast.success(
					`¡Cuenta creada con éxito! Bienvenido, ${response.usuario.nombre}`,
				);
				navigate({ to: "/dashboard" });
			} catch (error: unknown) {
				toast.error(getErrorMessage(error));
			}
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="nombre">
					{(campo) => (
						<campo.CampoTexto
							label="Nombre Completo"
							placeholder="Juan Pérez"
							autoComplete="name"
						/>
					)}
				</form.AppField>
				<form.AppField name="email">
					{(campo) => (
						<campo.CampoTexto
							label="Correo Electrónico"
							type="email"
							placeholder="juan@ejemplo.com"
							autoComplete="email"
						/>
					)}
				</form.AppField>
				<form.AppField name="password">
					{(campo) => (
						<campo.CampoTexto
							label="Contraseña"
							type="password"
							placeholder="Mínimo 12 caracteres (1 Mayús, 1 Núm, 1 Esp)"
							autoComplete="new-password"
							helperText="Al menos 12 caracteres con mayúscula, número y símbolo."
						/>
					)}
				</form.AppField>

				<form.BotonEnviar className="w-full mt-2" size="lg">
					<UserPlus className="h-4 w-4 mr-1.5" />
					Crear Cuenta
				</form.BotonEnviar>
			</form.Formulario>
		</form.AppForm>
	);
}
