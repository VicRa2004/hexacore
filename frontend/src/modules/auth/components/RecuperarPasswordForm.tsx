import { MailCheck, Send } from "lucide-react";
import { useAppForm } from "@/core/components/form/useAppForm";
import { useRecuperarPasswordMutation } from "../hooks/useCuentaMutation";
import { recuperarPasswordSchema } from "../schemas/authSchemas";

export function RecuperarPasswordForm() {
	const recuperar = useRecuperarPasswordMutation();

	const form = useAppForm({
		defaultValues: { email: "" },
		validators: { onSubmit: recuperarPasswordSchema },
		onSubmit: ({ value }) => recuperar.mutateAsync(value.email),
	});

	if (recuperar.isSuccess) {
		return (
			<div
				className="flex flex-col items-center gap-3 text-center"
				role="status"
			>
				<MailCheck className="h-10 w-10 text-emerald-400" />
				<p className="text-sm text-tinta-suave">{recuperar.data.mensaje}</p>
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
				<form.BotonEnviar className="w-full" size="lg">
					<Send className="h-4 w-4" />
					Enviar enlace
				</form.BotonEnviar>
			</form.Formulario>
		</form.AppForm>
	);
}
