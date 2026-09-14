import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { getErrorMessage } from "@/core/api/client";
import { useAuthStore } from "@/core/auth/store";
import { Button } from "@/core/components/ui/Button";
import { Input } from "@/core/components/ui/Input";
import { authApi } from "../api/authApi";
import { type RegisterInput, registerSchema } from "../schemas/authSchemas";

function extractErrorMessage(err: unknown): string | undefined {
	if (!err) return undefined;
	if (typeof err === "string") return err;
	if (
		typeof err === "object" &&
		"message" in err &&
		typeof (err as { message?: unknown }).message === "string"
	) {
		return (err as { message: string }).message;
	}
	return String(err);
}

export function RegisterForm() {
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		} as RegisterInput,
		validators: {
			onChange: registerSchema,
		},
		onSubmit: async ({ value }) => {
			setIsLoading(true);
			try {
				const response = await authApi.register(value);
				login(response);
				toast.success(
					`¡Cuenta creada con éxito! Bienvenido, ${response.user.name}`,
				);
				navigate({ to: "/dashboard" });
			} catch (error: unknown) {
				toast.error(getErrorMessage(error));
			} finally {
				setIsLoading(false);
			}
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="name">
				{(field) => (
					<Input
						label="Nombre Completo"
						type="text"
						placeholder="Juan Pérez"
						autoComplete="name"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={extractErrorMessage(field.state.meta.errors[0])}
					/>
				)}
			</form.Field>

			<form.Field name="email">
				{(field) => (
					<Input
						label="Correo Electrónico"
						type="email"
						placeholder="juan@ejemplo.com"
						autoComplete="email"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={extractErrorMessage(field.state.meta.errors[0])}
					/>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<Input
						label="Contraseña"
						type="password"
						placeholder="Mínimo 12 caracteres (1 Mayús, 1 Núm, 1 Esp)"
						autoComplete="new-password"
						helperText="Al menos 12 caracteres con mayúscula, número y símbolo."
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={extractErrorMessage(field.state.meta.errors[0])}
					/>
				)}
			</form.Field>

			<Button
				type="submit"
				className="w-full mt-2"
				size="lg"
				isLoading={isLoading}
			>
				<UserPlus className="h-4 w-4 mr-1.5" />
				Crear Cuenta
			</Button>
		</form>
	);
}
