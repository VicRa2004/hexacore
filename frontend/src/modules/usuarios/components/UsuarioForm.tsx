import { Save, UserPlus } from "lucide-react";
import type { Usuario } from "@/core/auth/types";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Button } from "@/core/components/ui/Button";
import { Dialog } from "@/core/components/ui/Dialog";
import {
	useActualizarUsuarioMutation,
	useCrearUsuarioMutation,
} from "../hooks/useUsuariosMutation";
import {
	crearUsuarioSchema,
	editarUsuarioSchema,
	type UsuarioFormInput,
} from "../schemas/usuarioSchemas";

interface UsuarioDialogProps {
	abierto: boolean;
	/** Sin usuario = alta. */
	usuario?: Usuario | null;
	onCerrar: () => void;
}

/** Alta y edición de usuario en modal (3 campos: ver skill `patron-formulario`). */
export function UsuarioDialog({
	abierto,
	usuario,
	onCerrar,
}: UsuarioDialogProps) {
	return (
		<Dialog
			abierto={abierto}
			onCerrar={onCerrar}
			titulo={usuario ? `Editar ${usuario.nombre}` : "Nuevo usuario"}
			descripcion={
				usuario
					? "Deja la contraseña vacía para no cambiarla."
					: "Recibirá un correo de bienvenida. Asigna sus roles después desde «Permisos»."
			}
		>
			{abierto && (
				<UsuarioForm
					key={usuario?.id ?? "nuevo"}
					usuario={usuario ?? undefined}
					onListo={onCerrar}
				/>
			)}
		</Dialog>
	);
}

function UsuarioForm({
	usuario,
	onListo,
}: {
	usuario?: Usuario;
	onListo: () => void;
}) {
	const crear = useCrearUsuarioMutation();
	const actualizar = useActualizarUsuarioMutation();

	const form = useAppForm({
		defaultValues: {
			nombre: usuario?.nombre ?? "",
			email: usuario?.email ?? "",
			password: "",
		} as UsuarioFormInput,
		validators: {
			onSubmit: usuario ? editarUsuarioSchema : crearUsuarioSchema,
		},
		onSubmit: async ({ value }) => {
			const datos = {
				nombre: value.nombre.trim(),
				email: value.email.trim(),
			};
			if (usuario) {
				await actualizar.mutateAsync({
					id: usuario.id,
					datos: value.password
						? { ...datos, password: value.password }
						: datos,
				});
			} else {
				await crear.mutateAsync({ ...datos, password: value.password });
			}
			onListo();
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="nombre">
					{(campo) => (
						<campo.CampoTexto
							label="Nombre completo"
							placeholder="Juan Pérez"
							autoComplete="off"
						/>
					)}
				</form.AppField>
				<form.AppField name="email">
					{(campo) => (
						<campo.CampoTexto
							label="Correo electrónico"
							type="email"
							placeholder="juan@ejemplo.com"
							autoComplete="off"
						/>
					)}
				</form.AppField>
				<form.AppField name="password">
					{(campo) => (
						<campo.CampoTexto
							label={usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
							type="password"
							placeholder={usuario ? "Sin cambios" : "Mínimo 12 caracteres"}
							autoComplete="new-password"
							helperText="Al menos 12 caracteres con mayúscula, minúscula, número y símbolo."
						/>
					)}
				</form.AppField>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" onClick={onListo}>
						Cancelar
					</Button>
					<form.BotonEnviar>
						{usuario ? <Save /> : <UserPlus />}
						{usuario ? "Guardar cambios" : "Crear usuario"}
					</form.BotonEnviar>
				</div>
			</form.Formulario>
		</form.AppForm>
	);
}
