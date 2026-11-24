import { useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { Dialog } from "@/core/components/ui/Dialog";
import {
	modalDemoSchema,
	paginaDemoSchema,
} from "../schemas/formulariosDemoSchemas";
import { AsistentePasosDemo } from "./AsistentePasosDemo";

function FormularioModalDemo({ onListo }: { onListo: () => void }) {
	const form = useAppForm({
		defaultValues: {
			nombre: "",
			email: "",
			rol: "editor",
			activo: true,
		},
		validators: { onSubmit: modalDemoSchema },
		onSubmit: async ({ value }) => {
			await new Promise((resolver) => setTimeout(resolver, 300));
			toast.success(`Miembro invitado: ${value.nombre}`);
			onListo();
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="nombre">
					{(campo) => (
						<campo.CampoTexto label="Nombre" placeholder="Marta Salas" />
					)}
				</form.AppField>
				<form.AppField name="email">
					{(campo) => (
						<campo.CampoTexto
							label="Email"
							type="email"
							placeholder="marta@ejemplo.com"
						/>
					)}
				</form.AppField>
				<form.AppField name="rol">
					{(campo) => (
						<campo.CampoSelect label="Rol">
							<option value="admin">Administrador</option>
							<option value="editor">Editor</option>
							<option value="lector">Lector</option>
						</campo.CampoSelect>
					)}
				</form.AppField>
				<form.AppField name="activo">
					{(campo) => <campo.CampoCheckbox label="Cuenta activa al crear" />}
				</form.AppField>
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="ghost" onClick={onListo}>
						Cancelar
					</Button>
					<form.BotonEnviar>Guardar</form.BotonEnviar>
				</div>
			</form.Formulario>
		</form.AppForm>
	);
}

function FormularioPaginaDemo() {
	const form = useAppForm({
		defaultValues: {
			nombreOrganizacion: "Hexacore Labs",
			slug: "hexacore-labs",
			emailContacto: "soporte@hexacore.dev",
			sitioWeb: "https://hexacore.dev",
			zonaHoraria: "Europe/Madrid",
			plan: "profesional",
			notificaciones: true,
			modoMantenimiento: false,
		},
		validators: { onSubmit: paginaDemoSchema },
		onSubmit: async ({ value }) => {
			await new Promise((resolver) => setTimeout(resolver, 300));
			toast.success(`Organización actualizada: ${value.nombreOrganizacion}`);
			form.reset(value);
		},
	});

	return (
		<div className="space-y-4 rounded-xl border border-borde bg-fondo p-4 sm:p-6">
			<Encabezado
				titulo="Ajustes del espacio"
				descripcion="Maqueta del contenedor «Página propia» (6–12 campos agrupados en Card por sección)."
			/>

			<form.AppForm>
				<form.Formulario className="space-y-4">
					<div className="grid gap-4 lg:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Datos generales</CardTitle>
								<CardDescription>Identidad pública y contacto.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<form.AppField name="nombreOrganizacion">
									{(campo) => (
										<campo.CampoTexto
											label="Nombre"
											placeholder="Hexacore Labs"
										/>
									)}
								</form.AppField>
								<form.AppField name="slug">
									{(campo) => (
										<campo.CampoTexto
											label="Identificador URL"
											placeholder="mi-organizacion"
										/>
									)}
								</form.AppField>
								<form.AppField name="emailContacto">
									{(campo) => (
										<campo.CampoTexto
											label="Email de contacto"
											type="email"
											placeholder="soporte@empresa.com"
										/>
									)}
								</form.AppField>
								<form.AppField name="sitioWeb">
									{(campo) => (
										<campo.CampoTexto
											label="Sitio web"
											placeholder="https://empresa.com"
										/>
									)}
								</form.AppField>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Configuración y plan</CardTitle>
								<CardDescription>
									Preferencias regionales y estado.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								<form.AppField name="zonaHoraria">
									{(campo) => (
										<campo.CampoSelect label="Zona horaria">
											<option value="Europe/Madrid">Europe/Madrid</option>
											<option value="America/Mexico_City">
												America/Mexico_City
											</option>
											<option value="UTC">UTC</option>
										</campo.CampoSelect>
									)}
								</form.AppField>
								<form.AppField name="plan">
									{(campo) => (
										<campo.CampoSelect label="Plan">
											<option value="inicial">Inicial</option>
											<option value="profesional">Profesional</option>
											<option value="empresa">Empresa</option>
										</campo.CampoSelect>
									)}
								</form.AppField>
								<div className="space-y-2 pt-2">
									<form.AppField name="notificaciones">
										{(campo) => (
											<campo.CampoCheckbox label="Alertas por correo electrónico" />
										)}
									</form.AppField>
									<form.AppField name="modoMantenimiento">
										{(campo) => (
											<campo.CampoCheckbox label="Activar modo mantenimiento" />
										)}
									</form.AppField>
								</div>
							</CardContent>
						</Card>
					</div>

					<form.Subscribe selector={(state) => state.isDirty}>
						{(sucio) =>
							sucio ? (
								<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-acento-borde bg-superficie px-4 py-3 shadow-sm">
									<p className="text-sm text-tinta-suave">
										Tienes cambios sin guardar en esta página.
									</p>
									<div className="flex gap-2">
										<Button variant="ghost" onClick={() => form.reset()}>
											Descartar
										</Button>
										<form.BotonEnviar>Guardar cambios</form.BotonEnviar>
									</div>
								</div>
							) : (
								<p className="text-xs text-tinta-tenue">
									Edita cualquier campo para ver la barra de guardado de
									cambios.
								</p>
							)
						}
					</form.Subscribe>
				</form.Formulario>
			</form.AppForm>
		</div>
	);
}

/** Demuestra los campos de core/components/form y los tres contenedores de patron-formulario. */
export function SeccionFormularios() {
	const [modalAbierto, setModalAbierto] = useState(false);

	return (
		<section id="formularios" className="scroll-mt-28 space-y-6">
			<div>
				<h2 className="text-xl font-semibold tracking-tight text-tinta">
					Formularios (
					<code className="font-mono text-base">patron-formulario</code>)
				</h2>
				<p className="text-sm text-tinta-tenue">
					Ejemplos con <code className="font-mono text-xs">useAppForm</code> y
					campos conectados en los tres contenedores: modal, página y varios
					pasos.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Contenedor 1: Modal (Dialog)</CardTitle>
					<CardDescription>
						Para formularios de hasta 5 campos simples lanzados desde una lista.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button onClick={() => setModalAbierto(true)}>
						Abrir formulario en modal
					</Button>
					<Dialog
						abierto={modalAbierto}
						onCerrar={() => setModalAbierto(false)}
						titulo="Invitar miembro"
						descripcion="El contenido se monta solo mientras el modal está abierto."
					>
						{modalAbierto && (
							<FormularioModalDemo onListo={() => setModalAbierto(false)} />
						)}
					</Dialog>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Contenedor 2: Página propia</CardTitle>
					<CardDescription>
						Para 6–12 campos o secciones agrupadas en tarjetas con barra de
						guardado.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FormularioPaginaDemo />
				</CardContent>
			</Card>

			<AsistentePasosDemo />
		</section>
	);
}
