import { KeyRound } from "lucide-react";
import { useAppForm } from "@/core/components/form/useAppForm";
import { useRestablecerPasswordMutation } from "../hooks/useCuentaMutation";
import {
	type RestablecerPasswordInput,
	restablecerPasswordSchema,
} from "../schemas/authSchemas";

export function RestablecerPasswordForm({ token }: { token: string }) {
	const restablecer = useRestablecerPasswordMutation();

	const form = useAppForm({
		defaultValues: {
			password: "",
			confirmacion: "",
		} as RestablecerPasswordInput,
		validators: { onSubmit: restablecerPasswordSchema },
		onSubmit: ({ value }) =>
			restablecer.mutateAsync({ token, password: value.password }),
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="password">
					{(campo) => (
						<campo.CampoTexto
							label="Nueva contraseña"
							type="password"
							autoComplete="new-password"
							helperText="Al menos 12 caracteres con mayúscula, número y símbolo."
						/>
					)}
				</form.AppField>
				<form.AppField name="confirmacion">
					{(campo) => (
						<campo.CampoTexto
							label="Repite la contraseña"
							type="password"
							autoComplete="new-password"
						/>
					)}
				</form.AppField>
				<form.BotonEnviar className="w-full" size="lg">
					<KeyRound className="h-4 w-4" />
					Guardar contraseña
				</form.BotonEnviar>
			</form.Formulario>
		</form.AppForm>
	);
}
