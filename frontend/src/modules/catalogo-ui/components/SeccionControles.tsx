import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, type ButtonProps } from "@/core/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { Checkbox } from "@/core/components/ui/Checkbox";
import { Input } from "@/core/components/ui/Input";
import { Select } from "@/core/components/ui/Select";
import { Spinner } from "@/core/components/ui/Spinner";

const VARIANTES_BOTON: {
	variante: NonNullable<ButtonProps["variant"]>;
	etiqueta: string;
	hoverClase: string;
}[] = [
	{ variante: "primary", etiqueta: "Primary", hoverClase: "bg-acento-hover" },
	{ variante: "secondary", etiqueta: "Secondary", hoverClase: "bg-borde" },
	{
		variante: "outline",
		etiqueta: "Outline",
		hoverClase: "bg-elevada border-borde-fuerte",
	},
	{ variante: "danger", etiqueta: "Danger", hoverClase: "bg-peligro-hover" },
	{
		variante: "ghost",
		etiqueta: "Ghost",
		hoverClase: "bg-elevada text-tinta",
	},
];

/** Muestra Button, Input, Select y Checkbox en todos sus estados visuales. */
export function SeccionControles() {
	const [passwordDemo, setPasswordDemo] = useState("ClaveSegura#2026");

	return (
		<section id="controles" className="scroll-mt-28 space-y-6">
			<div>
				<h2 className="text-xl font-semibold tracking-tight text-tinta">
					Controles y estados de entrada
				</h2>
				<p className="text-sm text-tinta-tenue">
					Botones y campos nativos en estado normal, hover, foco, error,
					deshabilitado y cargando.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Button</CardTitle>
					<CardDescription>
						Cinco variantes por estado visual, más escala de tamaños con iconos.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="border-b border-borde text-tinta-tenue">
								<tr>
									<th className="py-2 pr-4 font-medium">Variante</th>
									<th className="px-3 py-2 font-medium">Normal</th>
									<th className="px-3 py-2 font-medium">Hover</th>
									<th className="px-3 py-2 font-medium">Foco</th>
									<th className="px-3 py-2 font-medium">Deshabilitado</th>
									<th className="px-3 py-2 font-medium">Cargando</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-borde">
								{VARIANTES_BOTON.map(({ variante, etiqueta, hoverClase }) => (
									<tr key={variante}>
										<td className="py-3 pr-4 font-mono text-tinta-suave">
											{etiqueta}
										</td>
										<td className="px-3 py-3">
											<Button variant={variante}>Acción</Button>
										</td>
										<td className="px-3 py-3">
											<Button variant={variante} className={hoverClase}>
												Hover
											</Button>
										</td>
										<td className="px-3 py-3">
											<Button
												variant={variante}
												className="ring-2 ring-acento ring-offset-2 ring-offset-superficie"
											>
												Foco
											</Button>
										</td>
										<td className="px-3 py-3">
											<Button variant={variante} disabled>
												Bloqueado
											</Button>
										</td>
										<td className="px-3 py-3">
											<Button variant={variante} isLoading>
												Guardando
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="flex flex-wrap items-center gap-3 border-t border-borde pt-4">
						<span className="text-xs font-medium text-tinta-tenue">
							Tamaños:
						</span>
						<Button size="sm">
							<Plus />
							Pequeño (sm)
						</Button>
						<Button size="md">
							<Save />
							Mediano (md)
						</Button>
						<Button size="lg">
							<Trash2 />
							Grande (lg)
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Input</CardTitle>
					<CardDescription>
						Incluye soporte automático para mostrar/ocultar en{" "}
						<code className="font-mono text-xs">type="password"</code>.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<Input
						label="Normal"
						placeholder="ana@ejemplo.com"
						helperText="Texto de ayuda debajo del campo"
					/>
					<Input
						label="Hover (borde fuerte)"
						placeholder="cursor encima"
						className="border-borde-fuerte"
					/>
					<Input
						label="Foco (anillo acento)"
						defaultValue="Valor activo"
						placeholder="Escribe aquí"
						className="border-acento ring-3 ring-acento/20"
					/>
					<Input
						label="Error"
						defaultValue="correo-invalido"
						placeholder="ana@ejemplo.com"
						error="Introduce un correo electrónico válido"
					/>
					<Input
						label="Deshabilitado"
						defaultValue="Solo lectura"
						placeholder="No editable"
						disabled
					/>
					<div className="relative">
						<Input
							label="Cargando"
							defaultValue="Verificando disponibilidad..."
							placeholder="Usuario"
							disabled
							className="pr-9"
						/>
						<Spinner
							size="sm"
							className="pointer-events-none absolute right-2.5 top-[34px] text-tinta-tenue"
						/>
					</div>
					<Input
						label="Contraseña (interactivo)"
						type="password"
						value={passwordDemo}
						onChange={(e) => setPasswordDemo(e.target.value)}
						placeholder="Mínimo 12 caracteres"
						autoComplete="current-password"
					/>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Select</CardTitle>
						<CardDescription>
							Selector nativo alineado visualmente con{" "}
							<code className="font-mono text-xs">Input</code>.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						<Select
							label="Normal"
							defaultValue="editor"
							helperText="Rol asignado en el espacio"
						>
							<option value="admin">Administrador</option>
							<option value="editor">Editor</option>
							<option value="lector">Lector</option>
						</Select>
						<Select
							label="Hover"
							defaultValue="editor"
							className="border-borde-fuerte"
						>
							<option value="editor">Editor</option>
						</Select>
						<Select
							label="Foco"
							defaultValue="admin"
							className="border-acento ring-3 ring-acento/20"
						>
							<option value="admin">Administrador</option>
						</Select>
						<Select
							label="Error"
							defaultValue=""
							error="Debes seleccionar una opción"
						>
							<option value="">Selecciona un rol...</option>
							<option value="admin">Administrador</option>
						</Select>
						<Select label="Deshabilitado" defaultValue="lector" disabled>
							<option value="lector">Lector</option>
						</Select>
						<div className="relative">
							<Select
								label="Cargando"
								defaultValue="cargando"
								disabled
								className="pr-9"
							>
								<option value="cargando">Cargando catálogo...</option>
							</Select>
							<Spinner
								size="sm"
								className="pointer-events-none absolute right-8 top-[34px] text-tinta-tenue"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Checkbox</CardTitle>
						<CardDescription>
							Casilla nativa con etiqueta clicable, foco y validación.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						<Checkbox label="Normal sin marcar" defaultChecked={false} />
						<Checkbox label="Normal marcado" defaultChecked />
						<Checkbox
							label="Hover (sobre etiqueta)"
							className="text-acento-tinta"
						/>
						<Checkbox
							label="Foco visible"
							defaultChecked
							className="[&_input]:outline-2 [&_input]:outline-offset-2 [&_input]:outline-acento"
						/>
						<Checkbox
							label="Con error de validación"
							error="Debes aceptar los términos"
						/>
						<Checkbox label="Deshabilitado sin marcar" disabled />
						<Checkbox label="Deshabilitado marcado" defaultChecked disabled />
						<div className="flex items-center gap-2">
							<Checkbox label="Guardando preferencia" defaultChecked disabled />
							<Spinner size="sm" className="text-tinta-tenue" />
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
