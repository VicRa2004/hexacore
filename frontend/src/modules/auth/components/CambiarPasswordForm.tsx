import { useForm } from "@tanstack/react-form";
import { KeyRound } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { Input } from "@/core/components/ui/Input";
import { useCambiarPasswordMutation } from "../hooks/useCuentaMutation";
import {
	type CambiarPasswordInput,
	cambiarPasswordSchema,
} from "../schemas/authSchemas";

export function CambiarPasswordForm() {
	const cambiar = useCambiarPasswordMutation();

	const form = useForm({
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

	const campos = [
		{
			name: "passwordActual",
			label: "Contraseña actual",
			auto: "current-password",
		},
		{ name: "passwordNueva", label: "Nueva contraseña", auto: "new-password" },
		{ name: "confirmacion", label: "Repite la nueva", auto: "new-password" },
	] as const;

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<CardTitle className="text-lg">Cambiar contraseña</CardTitle>
				<CardDescription>
					Se cerrarán tus sesiones en otros dispositivos.
				</CardDescription>
			</CardHeader>
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
				{campos.map(({ name, label, auto }) => (
					<form.Field key={name} name={name}>
						{(field) => (
							<Input
								id={`perfil-${name}`}
								label={label}
								type="password"
								autoComplete={auto}
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								error={field.state.meta.errors[0]?.message}
							/>
						)}
					</form.Field>
				))}
				<div className="flex justify-end">
					<Button type="submit" isLoading={cambiar.isPending}>
						<KeyRound className="h-4 w-4" />
						Cambiar contraseña
					</Button>
				</div>
			</form>
		</Card>
	);
}
