import { useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { type PasoItem, Pasos } from "@/core/components/ui/Pasos";
import {
	asistenteCompletoSchema,
	type AsistenteCompletoValores,
	pasoCuentaSchema,
	pasoPerfilSchema,
	validarPasoAsistente,
} from "../schemas/formulariosDemoSchemas";

const PASOS_ASISTENTE: PasoItem[] = [
	{
		id: "cuenta",
		titulo: "Cuenta",
		descripcion: "Credenciales de acceso",
	},
	{
		id: "perfil",
		titulo: "Perfil",
		descripcion: "Rol y equipo",
	},
	{
		id: "resumen",
		titulo: "Resumen",
		descripcion: "Revisión final",
	},
];

const VALORES_INICIALES: AsistenteCompletoValores = {
	nombre: "",
	email: "",
	password: "",
	rol: "editor",
	equipo: "",
	recibirResumen: true,
};

/** Ejemplo del contenedor «Varios pasos» de patron-formulario usando <Pasos>. */
export function AsistentePasosDemo() {
	const [pasoActual, setPasoActual] = useState(0);

	const form = useAppForm({
		defaultValues: VALORES_INICIALES,
		validators: { onSubmit: asistenteCompletoSchema },
		onSubmit: async ({ value }) => {
			await new Promise((resolver) => setTimeout(resolver, 350));
			toast.success(`Alta completada para ${value.nombre} (${value.rol})`);
			form.reset();
			setPasoActual(0);
		},
	});

	const avanzarPaso = () => {
		const schema = pasoActual === 0 ? pasoCuentaSchema : pasoPerfilSchema;
		const { valido, camposConError } = validarPasoAsistente(
			schema,
			form.state.values,
		);
		if (!valido) {
			for (const campo of camposConError) {
				void form.validateField(
					campo as keyof AsistenteCompletoValores,
					"submit",
				);
			}
			return;
		}
		setPasoActual((actual) => Math.min(2, actual + 1));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Contenedor 3: Varios pasos (asistente)</CardTitle>
				<CardDescription>
					Un único <code className="font-mono text-xs">useAppForm</code>,
					validación por paso con Zod, navegación hacia atrás sin perder datos y
					resumen de solo lectura.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<Pasos
					pasos={PASOS_ASISTENTE}
					actual={pasoActual}
					onSeleccionar={setPasoActual}
				/>

				<form.AppForm>
					<form.Formulario className="space-y-4">
						{pasoActual === 0 && (
							<div className="grid gap-4 sm:grid-cols-2">
								<form.AppField name="nombre">
									{(campo) => (
										<campo.CampoTexto
											label="Nombre completo"
											placeholder="Lucía Fernández"
										/>
									)}
								</form.AppField>
								<form.AppField name="email">
									{(campo) => (
										<campo.CampoTexto
											label="Email corporativo"
											type="email"
											placeholder="lucia@empresa.com"
										/>
									)}
								</form.AppField>
								<div className="sm:col-span-2">
									<form.AppField name="password">
										{(campo) => (
											<campo.CampoTexto
												label="Contraseña inicial"
												type="password"
												placeholder="Mínimo 8 caracteres"
												autoComplete="new-password"
											/>
										)}
									</form.AppField>
								</div>
							</div>
						)}

						{pasoActual === 1 && (
							<div className="space-y-4">
								<div className="grid gap-4 sm:grid-cols-2">
									<form.AppField name="rol">
										{(campo) => (
											<campo.CampoSelect label="Rol principal">
												<option value="admin">Administrador</option>
												<option value="editor">Editor</option>
												<option value="lector">Lector</option>
											</campo.CampoSelect>
										)}
									</form.AppField>
									<form.AppField name="equipo">
										{(campo) => (
											<campo.CampoTexto
												label="Equipo"
												placeholder="Plataforma"
											/>
										)}
									</form.AppField>
								</div>
								<form.AppField name="recibirResumen">
									{(campo) => (
										<campo.CampoCheckbox label="Enviar resumen semanal de actividad" />
									)}
								</form.AppField>
							</div>
						)}

						{pasoActual === 2 && (
							<form.Subscribe selector={(state) => state.values}>
								{(valores) => (
									<dl className="grid gap-3 rounded-lg border border-borde bg-fondo p-4 text-sm sm:grid-cols-2">
										<div>
											<dt className="text-xs text-tinta-tenue">Nombre</dt>
											<dd className="font-medium text-tinta">
												{valores.nombre}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-tinta-tenue">Email</dt>
											<dd className="font-medium text-tinta">
												{valores.email}
											</dd>
										</div>
										<div>
											<dt className="text-xs text-tinta-tenue">Rol</dt>
											<dd className="font-medium text-tinta">{valores.rol}</dd>
										</div>
										<div>
											<dt className="text-xs text-tinta-tenue">Equipo</dt>
											<dd className="font-medium text-tinta">
												{valores.equipo}
											</dd>
										</div>
										<div className="sm:col-span-2">
											<dt className="text-xs text-tinta-tenue">
												Resumen semanal
											</dt>
											<dd className="font-medium text-tinta">
												{valores.recibirResumen ? "Activado" : "Desactivado"}
											</dd>
										</div>
									</dl>
								)}
							</form.Subscribe>
						)}

						<div className="flex items-center justify-between border-t border-borde pt-4">
							<Button
								variant="ghost"
								disabled={pasoActual === 0}
								onClick={() =>
									setPasoActual((actual) => Math.max(0, actual - 1))
								}
							>
								Atrás
							</Button>
							{pasoActual < 2 ? (
								<Button onClick={avanzarPaso}>Siguiente</Button>
							) : (
								<form.BotonEnviar>Confirmar y crear</form.BotonEnviar>
							)}
						</div>
					</form.Formulario>
				</form.AppForm>
			</CardContent>
		</Card>
	);
}
