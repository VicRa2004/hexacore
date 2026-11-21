import { Plus } from "lucide-react";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Button } from "@/core/components/ui/Button";
import { useCrearRolMutation } from "../hooks/useRolesMutation";
import { type CrearRolInput, crearRolSchema } from "../schemas/rolSchemas";

/** Alta de un rol sin permisos (modal): se marcan después en la matriz. */
export function CrearRolForm({
	onCreado,
	onCancelar,
}: {
	onCreado: (id: number) => void;
	onCancelar: () => void;
}) {
	const crear = useCrearRolMutation();

	const form = useAppForm({
		defaultValues: { nombre: "", descripcion: "" } as CrearRolInput,
		validators: { onSubmit: crearRolSchema },
		onSubmit: async ({ value }) => {
			const rol = await crear.mutateAsync({
				nombre: value.nombre.trim(),
				descripcion: value.descripcion.trim() || null,
				permisoIds: [],
			});
			onCreado(rol.id);
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="nombre">
					{(campo) => <campo.CampoTexto label="Nombre" placeholder="SOPORTE" />}
				</form.AppField>
				<form.AppField name="descripcion">
					{(campo) => (
						<campo.CampoTexto
							label="Descripción (opcional)"
							placeholder="Atiende incidencias de los usuarios"
						/>
					)}
				</form.AppField>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" onClick={onCancelar}>
						Cancelar
					</Button>
					<form.BotonEnviar>
						<Plus />
						Crear rol
					</form.BotonEnviar>
				</div>
			</form.Formulario>
		</form.AppForm>
	);
}
