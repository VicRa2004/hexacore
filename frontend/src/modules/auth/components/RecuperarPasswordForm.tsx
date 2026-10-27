import { useForm } from "@tanstack/react-form";
import { MailCheck, Send } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import { Input } from "@/core/components/ui/Input";
import { useRecuperarPasswordMutation } from "../hooks/useCuentaMutation";
import { recuperarPasswordSchema } from "../schemas/authSchemas";

export function RecuperarPasswordForm() {
	const recuperar = useRecuperarPasswordMutation();

	const form = useForm({
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
				<p className="text-sm text-slate-300">{recuperar.data.mensaje}</p>
			</div>
		);
	}

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
			<form.Field name="email">
				{(field) => (
					<Input
						label="Correo Electrónico"
						type="email"
						placeholder="usuario@ejemplo.com"
						autoComplete="email"
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
				isLoading={recuperar.isPending}
			>
				<Send className="h-4 w-4" />
				Enviar enlace
			</Button>
		</form>
	);
}
