import { useForm } from "@tanstack/react-form";
import { Plus } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import { Input } from "@/core/components/ui/Input";
import { useCrearRolMutation } from "../hooks/useRolesMutation";
import { type CrearRolInput, crearRolSchema } from "../schemas/rolSchemas";

/** Alta rápida de un rol sin permisos: se marcan después en su tarjeta. */
export function CrearRolForm() {
	const crear = useCrearRolMutation();

	const form = useForm({
		defaultValues: { nombre: "", descripcion: "" } as CrearRolInput,
		validators: { onSubmit: crearRolSchema },
		onSubmit: async ({ value, formApi }) => {
			await crear.mutateAsync({
				nombre: value.nombre,
				descripcion: value.descripcion.trim() || null,
				permisoIds: [],
			});
			formApi.reset();
		},
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
			className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-start"
		>
			<form.Field name="nombre">
				{(field) => (
					<Input
						id="nuevo-rol-nombre"
						label="Nombre"
						placeholder="SOPORTE"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>
			<form.Field name="descripcion">
				{(field) => (
					<Input
						id="nuevo-rol-descripcion"
						label="Descripción"
						placeholder="Opcional"
						value={field.state.value}
						onBlur={field.handleBlur}
						onChange={(e) => field.handleChange(e.target.value)}
						error={field.state.meta.errors[0]?.message}
					/>
				)}
			</form.Field>
			<Button type="submit" className="sm:mt-6" isLoading={crear.isPending}>
				<Plus className="h-4 w-4" />
				Crear rol
			</Button>
		</form>
	);
}
