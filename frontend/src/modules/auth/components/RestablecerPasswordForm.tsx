import { useForm } from "@tanstack/react-form";
import { KeyRound } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import { Input } from "@/core/components/ui/Input";
import { useRestablecerPasswordMutation } from "../hooks/useCuentaMutation";
import {
	type RestablecerPasswordInput,
	restablecerPasswordSchema,
} from "../schemas/authSchemas";

export function RestablecerPasswordForm({ token }: { token: string }) {
	const restablecer = useRestablecerPasswordMutation();

	const form = useForm({
		defaultValues: {
			password: "",
			confirmacion: "",
		} as RestablecerPasswordInput,
		validators: { onSubmit: restablecerPasswordSchema },
		onSubmit: ({ value }) =>
			restablecer.mutateAsync({ token, password: value.password }),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit().catch(() => {
					// El toast de error ya lo muestra la mutación.
				});
			}}
			className="space-y-4"
		>
			<form.Field name="password">
				{(field) => (
					<Input
						id="nueva-password"
						label="Nueva contraseña"
						type="password"
						autoComplete="new-password"
						helperText="Al menos 12 caracteres con mayúscula, número y símbolo."
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>
			<form.Field name="confirmacion">
				{(field) => (
					<Input
						id="confirmar-password"
						label="Repite la contraseña"
						type="password"
						autoComplete="new-password"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>
			<Button
				type="submit"
				className="w-full"
				size="lg"
				isLoading={restablecer.isPending}
			>
				<KeyRound className="h-4 w-4" />
				Guardar contraseña
			</Button>
		</form>
	);
}
