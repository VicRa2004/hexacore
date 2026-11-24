import type { ReactNode } from "react";
import { useAppForm } from "@/core/components/form/useAppForm";
import { type CodigoInput, codigoSchema } from "../schemas/authSchemas";

/** Un campo de código (app de autenticación o recuperación) y su botón. */
export function CodigoForm({
	onEnviar,
	textoBoton,
	label = "Código de verificación",
}: {
	onEnviar: (codigo: string) => Promise<unknown>;
	textoBoton: ReactNode;
	label?: string;
}) {
	const form = useAppForm({
		defaultValues: { codigo: "" } as CodigoInput,
		validators: { onSubmit: codigoSchema },
		onSubmit: async ({ value }) => {
			await onEnviar(value.codigo.trim());
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="codigo">
					{(campo) => (
						<campo.CampoTexto
							label={label}
							inputMode="text"
							autoComplete="one-time-code"
							placeholder="123456"
							autoFocus
						/>
					)}
				</form.AppField>
				<form.BotonEnviar className="w-full">{textoBoton}</form.BotonEnviar>
			</form.Formulario>
		</form.AppForm>
	);
}
