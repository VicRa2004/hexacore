import {
	Bell,
	CheckCircle2,
	FolderOpen,
	MoreHorizontal,
	Settings,
	Shield,
	Trash2,
	User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/core/components/ui/Avatar";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { Dialog } from "@/core/components/ui/Dialog";
import { EmptyState } from "@/core/components/ui/EmptyState";
import { Menu, MenuOpcion, MenuSeparador } from "@/core/components/ui/Menu";
import { type PasoItem, Pasos } from "@/core/components/ui/Pasos";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { Spinner } from "@/core/components/ui/Spinner";
import { type Pestana, Tabs } from "@/core/components/ui/Tabs";
import { Tooltip } from "@/core/components/ui/Tooltip";

const AVATAR_SVG =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="%236366f1"/><circle cx="32" cy="24" r="12" fill="%23ffffff"/><path d="M14 56c2-11 34-11 36 0" fill="%23ffffff"/></svg>',
	);

const PASOS_DEMO: PasoItem[] = [
	{ id: "origen", titulo: "Origen", descripcion: "Conecta fuente" },
	{ id: "mapeo", titulo: "Mapeo", descripcion: "Asigna columnas" },
	{ id: "revision", titulo: "Revisión", descripcion: "Confirma envío" },
];

/** Muestra Badge, Card, Avatar, Spinner, Skeleton, Tooltip, Menu, Tabs, Dialog, ConfirmDialog, EmptyState y Pasos. */
export function SeccionSuperficies() {
	const [tabActiva, setTabActiva] = useState<"perfil" | "seguridad" | "avisos">(
		"perfil",
	);
	const [dialogAbierto, setDialogAbierto] = useState(false);
	const [confirmNormal, setConfirmNormal] = useState(false);
	const [confirmPeligroso, setConfirmPeligroso] = useState(false);
	const [cargandoConfirm, setCargandoConfirm] = useState(false);
	const [pasoDemo, setPasoDemo] = useState(1);

	const pestanas: Pestana<"perfil" | "seguridad" | "avisos">[] = [
		{
			clave: "perfil",
			etiqueta: (
				<>
					<User />
					Perfil
				</>
			),
			contenido: (
				<p className="text-sm text-tinta-suave">
					Contenido de la pestaña Perfil. Puedes navegar entre pestañas con las
					flechas izquierda y derecha, Inicio o Fin.
				</p>
			),
		},
		{
			clave: "seguridad",
			etiqueta: (
				<>
					<Shield />
					Seguridad
				</>
			),
			contenido: (
				<p className="text-sm text-tinta-suave">
					Políticas de sesiones activas, rotación de tokens y auditoría.
				</p>
			),
		},
		{
			clave: "avisos",
			etiqueta: (
				<>
					<Bell />
					Avisos
				</>
			),
			contenido: (
				<p className="text-sm text-tinta-suave">
					Preferencias de alertas críticas y resúmenes periódicos.
				</p>
			),
		},
	];

	const simularConfirmacion = () => {
		setCargandoConfirm(true);
		setTimeout(() => {
			setCargandoConfirm(false);
			setConfirmPeligroso(false);
			toast.success("Elemento eliminado en modo demo");
		}, 400);
	};

	return (
		<section id="superficies" className="scroll-mt-28 space-y-6">
			<div>
				<h2 className="text-xl font-semibold tracking-tight text-tinta">
					Superficies, feedback y navegación
				</h2>
				<p className="text-sm text-tinta-tenue">
					Primitivas de presentación, overlays nativos y estados de espera o
					vacío.
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Badge y Avatar</CardTitle>
						<CardDescription>
							Etiquetas de estado e iniciales con respaldo si la imagen falla.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex flex-wrap gap-2">
							<Badge variant="default">Default</Badge>
							<Badge variant="accent">Accent</Badge>
							<Badge variant="success">Success</Badge>
							<Badge variant="warning">Warning</Badge>
							<Badge variant="danger">Danger</Badge>
						</div>
						<div className="flex flex-wrap items-center gap-4 border-t border-borde pt-4">
							<Avatar nombre="Ana López" size="sm" />
							<Avatar nombre="Carlos Ruiz" size="md" />
							<Avatar nombre="Elena Martín" size="lg" />
							<Avatar nombre="Avatar SVG" src={AVATAR_SVG} size="md" />
							<Avatar
								nombre="Fallback Error"
								src="invalid://imagen-rota"
								size="md"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Spinner y Skeleton</CardTitle>
						<CardDescription>
							Indicadores de actividad y esqueletos de carga.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="flex items-center gap-5 text-acento">
							<Spinner size="sm" />
							<Spinner size="md" />
							<Spinner size="lg" />
						</div>
						<div className="space-y-2.5 border-t border-borde pt-4">
							<div className="flex items-center gap-3">
								<Skeleton className="size-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-3.5 w-1/2" />
									<Skeleton className="h-3 w-1/3" />
								</div>
							</div>
							<Skeleton className="h-8 w-full" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tooltip y Menu (Popover API)</CardTitle>
						<CardDescription>
							Etiquetas flotantes CSS y menú nativo con cierre por Escape o clic
							fuera.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap items-center gap-4">
						<Tooltip texto="Tooltip a la derecha" lado="derecha">
							<Button variant="outline">Hover / foco (derecha)</Button>
						</Tooltip>
						<Tooltip texto="Tooltip abajo" lado="abajo">
							<Button variant="outline">Hover / foco (abajo)</Button>
						</Tooltip>
						<Menu
							etiqueta="Acciones de ejemplo"
							claseDisparador="h-9 border border-borde bg-superficie px-3 text-sm font-medium text-tinta shadow-sm gap-2"
							disparador={
								<>
									<MoreHorizontal className="size-4" />
									Abrir menú
								</>
							}
						>
							<MenuOpcion onClick={() => toast.info("Configuración abierta")}>
								<Settings />
								Configuración
							</MenuOpcion>
							<MenuOpcion onClick={() => toast.info("Verificación completada")}>
								<CheckCircle2 />
								Validar estado
							</MenuOpcion>
							<MenuSeparador />
							<MenuOpcion peligro onClick={() => setConfirmPeligroso(true)}>
								<Trash2 />
								Eliminar elemento
							</MenuOpcion>
						</Menu>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Dialog y ConfirmDialog</CardTitle>
						<CardDescription>
							Modales sobre{" "}
							<code className="font-mono text-xs">&lt;dialog&gt;</code> nativo
							con foco atrapado.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-3">
						<Button variant="outline" onClick={() => setDialogAbierto(true)}>
							Abrir Dialog
						</Button>
						<Button variant="secondary" onClick={() => setConfirmNormal(true)}>
							ConfirmDialog estándar
						</Button>
						<Button variant="danger" onClick={() => setConfirmPeligroso(true)}>
							ConfirmDialog peligroso
						</Button>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Tabs</CardTitle>
					<CardDescription>
						Pestañas accesibles con navegación por teclado.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						etiqueta="Pestañas de demostración"
						pestanas={pestanas}
						activa={tabActiva}
						onCambio={setTabActiva}
					/>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Pasos</CardTitle>
						<CardDescription>
							Indicador reutilizable para asistentes multipaso.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Pasos
							pasos={PASOS_DEMO}
							actual={pasoDemo}
							onSeleccionar={setPasoDemo}
						/>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={pasoDemo === 0}
								onClick={() => setPasoDemo((p) => Math.max(0, p - 1))}
							>
								Anterior
							</Button>
							<Button
								size="sm"
								disabled={pasoDemo === PASOS_DEMO.length - 1}
								onClick={() =>
									setPasoDemo((p) => Math.min(PASOS_DEMO.length - 1, p + 1))
								}
							>
								Siguiente
							</Button>
						</div>
					</CardContent>
				</Card>

				<EmptyState
					icono={FolderOpen}
					titulo="Sin registros todavía"
					descripcion="Ejemplo del componente EmptyState con acción primaria."
					accion={
						<Button
							size="sm"
							onClick={() => toast.success("Acción de estado vacío ejecutada")}
						>
							Crear el primero
						</Button>
					}
				/>
			</div>

			<Dialog
				abierto={dialogAbierto}
				onCerrar={() => setDialogAbierto(false)}
				titulo="Ejemplo de Dialog"
				descripcion="Modal nativo con fondo inerte y cierre mediante Escape o clic exterior."
			>
				<p className="text-sm text-tinta-suave">
					Este diálogo usa los tokens de superficie, borde, sombra flotante y
					animación de entrada.
				</p>
				<div className="flex justify-end pt-2">
					<Button onClick={() => setDialogAbierto(false)}>Entendido</Button>
				</div>
			</Dialog>

			<ConfirmDialog
				abierto={confirmNormal}
				titulo="Confirmar publicación"
				mensaje="Los cambios pasarán a estar visibles para todo el equipo."
				textoConfirmar="Publicar"
				onCancelar={() => setConfirmNormal(false)}
				onConfirmar={() => {
					setConfirmNormal(false);
					toast.success("Publicación confirmada");
				}}
			/>

			<ConfirmDialog
				abierto={confirmPeligroso}
				titulo="Eliminar registro"
				mensaje="Esta acción es irreversible en un entorno real."
				textoConfirmar="Sí, eliminar"
				peligroso
				isLoading={cargandoConfirm}
				onCancelar={() => setConfirmPeligroso(false)}
				onConfirmar={simularConfirmacion}
			/>
		</section>
	);
}
