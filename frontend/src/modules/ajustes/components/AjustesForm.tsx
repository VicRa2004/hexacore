import { RotateCcw, Save } from "lucide-react";
import type { AjustesDto } from "@/core/api/schema.gen";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Button } from "@/core/components/ui/Button";
import { Card } from "@/core/components/ui/Card";
import { ACENTOS, type Acento } from "@/core/tema";
import { cn } from "@/core/utils/cn";
import { useActualizarAjustesMutation } from "../hooks/useAjustesMutation";
import { ajustesFormSchema } from "../schemas/ajustesSchemas";

interface AjustesFormProps {
	ajustes: AjustesDto;
	puedeEditar: boolean;
}

export function AjustesForm({ ajustes, puedeEditar }: AjustesFormProps) {
	const actualizar = useActualizarAjustesMutation();

	const form = useAppForm({
		defaultValues: {
			nombreApp: ajustes.nombreApp,
			colorMarca: ajustes.colorMarca,
			remitenteCorreo: ajustes.remitenteCorreo,
			registroPublicoAbierto: ajustes.registroPublicoAbierto,
		},
		validators: {
			onSubmit: ajustesFormSchema,
		},
		onSubmit: async ({ value }) => {
			const limpio = ajustesFormSchema.parse(value);
			const guardado = await actualizar.mutateAsync(limpio);
			form.reset({
				nombreApp: guardado.nombreApp,
				colorMarca: guardado.colorMarca,
				remitenteCorreo: guardado.remitenteCorreo,
				registroPublicoAbierto: guardado.registroPublicoAbierto,
			});
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-6">
				<fieldset disabled={!puedeEditar} className="space-y-6">
					<Card className="space-y-4">
						<div className="space-y-1">
							<h2 className="text-base font-semibold text-tinta">
								Identidad y marca
							</h2>
							<p className="text-xs text-tinta-tenue">
								Nombre visible en la interfaz y tono principal por defecto (
								<code className="font-mono">--marca-h</code>).
							</p>
						</div>
						<form.AppField name="nombreApp">
							{(campo) => (
								<campo.CampoTexto
									label="Nombre de la aplicación"
									placeholder="Mi Plataforma"
								/>
							)}
						</form.AppField>

						<form.AppField name="colorMarca">
							{(campo) => {
								const tono = Number.isFinite(campo.state.value)
									? campo.state.value
									: 277;
								const error = campo.state.meta.isTouched
									? campo.state.meta.errors[0]
									: undefined;
								const mensajeError =
									typeof error === "string"
										? error
										: error && typeof error === "object" && "message" in error
											? String(error.message)
											: undefined;

								return (
									<div className="space-y-2.5">
										<div className="flex items-center justify-between gap-2">
											<label
												htmlFor="colorMarca-numero"
												className="text-sm font-medium text-tinta-suave"
											>
												Color de marca por defecto (tono 0–360)
											</label>
											<span
												className="inline-flex items-center gap-1.5 rounded-full border border-borde bg-fondo px-2.5 py-0.5 font-mono text-xs text-tinta"
												aria-live="polite"
											>
												<span
													className="size-3 rounded-full"
													style={{
														backgroundColor: `oklch(55% 0.2 ${tono})`,
													}}
												/>
												{tono}°
											</span>
										</div>

										<div className="flex flex-wrap items-center gap-3">
											<input
												type="range"
												min={0}
												max={360}
												step={1}
												aria-label="Selector deslizante de tono de marca"
												value={tono}
												onChange={(e) =>
													campo.handleChange(Number(e.target.value))
												}
												onBlur={campo.handleBlur}
												className="h-2 min-w-44 flex-1 cursor-pointer accent-acento"
											/>
											<input
												id="colorMarca-numero"
												type="number"
												min={0}
												max={360}
												value={tono}
												onChange={(e) => {
													const n = Number(e.target.value);
													campo.handleChange(
														Number.isNaN(n) ? 0 : Math.round(n),
													);
												}}
												onBlur={campo.handleBlur}
												className="h-9 w-20 rounded-md border border-borde bg-superficie px-2.5 text-sm text-tinta focus-visible:outline-2 focus-visible:outline-acento"
											/>
										</div>

										<div className="flex flex-wrap items-center gap-2 pt-0.5">
											<span className="text-xs text-tinta-tenue">
												Sugeridos:
											</span>
											{(Object.keys(ACENTOS) as Acento[]).map((clave) => (
												<button
													key={clave}
													type="button"
													title={`${clave} (${ACENTOS[clave]}°)`}
													aria-label={`Usar tono ${clave}`}
													onClick={() => campo.handleChange(ACENTOS[clave])}
													style={{
														backgroundColor: `oklch(58% 0.19 ${ACENTOS[clave]})`,
													}}
													className={cn(
														"size-5 cursor-pointer rounded-full ring-offset-2 ring-offset-superficie transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50",
														tono === ACENTOS[clave] &&
															"ring-2 ring-borde-fuerte",
													)}
												/>
											))}
										</div>
										{mensajeError && (
											<p className="text-xs font-medium text-peligro-tinta">
												{mensajeError}
											</p>
										)}
									</div>
								);
							}}
						</form.AppField>
					</Card>

					<Card className="space-y-4">
						<div className="space-y-1">
							<h2 className="text-base font-semibold text-tinta">
								Correo electrónico
							</h2>
							<p className="text-xs text-tinta-tenue">
								Cabecera «From» usada al enviar enlaces de verificación y
								recuperación de contraseña.
							</p>
						</div>
						<form.AppField name="remitenteCorreo">
							{(campo) => (
								<campo.CampoTexto
									label="Remitente de correos"
									placeholder="Mi App <no-reply@mi-dominio.com>"
								/>
							)}
						</form.AppField>
					</Card>

					<Card className="space-y-4">
						<div className="space-y-1">
							<h2 className="text-base font-semibold text-tinta">
								Registro y acceso
							</h2>
							<p className="text-xs text-tinta-tenue">
								Controla si cualquier visitante puede crear una cuenta nueva
								desde la pantalla de acceso.
							</p>
						</div>
						<form.AppField name="registroPublicoAbierto">
							{(campo) => (
								<campo.CampoCheckbox label="Permitir registro público de nuevos usuarios" />
							)}
						</form.AppField>
					</Card>
				</fieldset>

				{puedeEditar && (
					<form.Subscribe selector={(state) => state.isDirty}>
						{(isDirty) =>
							isDirty ? (
								<div className="sticky bottom-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-borde bg-superficie px-4 py-3 shadow-flotante">
									<span
										className="mr-auto text-xs font-medium text-aviso-tinta"
										aria-live="polite"
									>
										Hay cambios sin guardar
									</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => form.reset()}
									>
										<RotateCcw />
										Descartar
									</Button>
									<form.BotonEnviar size="sm">
										<Save />
										Guardar
									</form.BotonEnviar>
								</div>
							) : null
						}
					</form.Subscribe>
				)}
			</form.Formulario>
		</form.AppForm>
	);
}
