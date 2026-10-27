import { KeyRound } from "lucide-react";
import { useAppForm } from "@/core/components/form/useAppForm";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { useCambiarPasswordMutation } from "../hooks/useCuentaMutation";
import {
	type CambiarPasswordInput,
	cambiarPasswordSchema,
} from "../schemas/authSchemas";

const campos = [
	{
		name: "passwordActual",
		label: "Contraseña actual",
		auto: "current-password",
	},
	{ name: "passwordNueva", label: "Nueva contraseña", auto: "new-password" },
	{ name: "confirmacion", label: "Repite la nueva", auto: "new-password" },
] as const;

export function CambiarPasswordForm() {
	const cambiar = useCambiarPasswordMutation();

	const form = useAppForm({
		defaultValues: {
			passwordActual: "",
			passwordNueva: "",
			confirmacion: "",
		} as CambiarPasswordInput,
		validators: { onSubmit: cambiarPasswordSchema },
		onSubmit: async ({ value, formApi }) => {
			await cambiar.mutateAsync({
				passwordActual: value.passwordActual,
				passwordNueva: value.passwordNueva,
			});
			formApi.reset();
		},
	});

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-lg">Cambiar contraseña</CardTitle>
				<CardDescription>
					Se cerrarán tus sesiones en otros dispositivos.
				</CardDescription>
			</CardHeader>
			<form.AppForm>
				<form.Formulario className="space-y-4">
					{campos.map(({ name, label, auto }) => (
						<form.AppField key={name} name={name}>
							{(campo) => (
								<campo.CampoTexto
									label={label}
									type="password"
									autoComplete={auto}
								/>
							)}
						</form.AppField>
					))}
					<div className="flex justify-end">
						<form.BotonEnviar>
							<KeyRound className="h-4 w-4" />
							Cambiar contraseña
						</form.BotonEnviar>
					</div>
				</form.Formulario>
			</form.AppForm>
		</Card>
	);
}
