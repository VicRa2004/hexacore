import { Plus } from "lucide-react";
import { useAppForm } from "@/core/components/form/useAppForm";
import { useCrearRolMutation } from "../hooks/useRolesMutation";
import { type CrearRolInput, crearRolSchema } from "../schemas/rolSchemas";

/** Alta rápida de un rol sin permisos: se marcan después en su tarjeta. */
export function CrearRolForm() {
	const crear = useCrearRolMutation();

	const form = useAppForm({
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
		<form.AppForm>
			<form.Formulario className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-start">
				<form.AppField name="nombre">
					{(campo) => <campo.CampoTexto label="Nombre" placeholder="SOPORTE" />}
				</form.AppField>
				<form.AppField name="descripcion">
					{(campo) => (
						<campo.CampoTexto label="Descripción" placeholder="Opcional" />
					)}
				</form.AppField>
				<form.BotonEnviar className="sm:mt-6">
					<Plus className="h-4 w-4" />
					Crear rol
				</form.BotonEnviar>
			</form.Formulario>
		</form.AppForm>
	);
}
