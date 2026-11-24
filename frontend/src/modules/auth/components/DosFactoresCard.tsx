import { Copy, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AltaDosFactores } from "@/core/api/schema.gen";
import { useAppForm } from "@/core/components/form/useAppForm";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { Dialog } from "@/core/components/ui/Dialog";
import { Skeleton } from "@/core/components/ui/Skeleton";
import {
	useActivarDosFactoresMutation,
	useDesactivarDosFactoresMutation,
	useDosFactoresQuery,
	useIniciarDosFactoresMutation,
	useRegenerarCodigosMutation,
} from "../hooks/useDosFactores";
import {
	type DesactivarDosFactoresInput,
	desactivarDosFactoresSchema,
} from "../schemas/authSchemas";
import { CodigoForm } from "./CodigoForm";
import { CodigoQr } from "./CodigoQr";

/** Verificación en dos pasos (TOTP): alta con QR, códigos de recuperación y baja. */
export function DosFactoresCard() {
	const { data: estado, isLoading } = useDosFactoresQuery();
	const iniciar = useIniciarDosFactoresMutation();
	const activar = useActivarDosFactoresMutation();
	const regenerar = useRegenerarCodigosMutation();
	const [alta, setAlta] = useState<AltaDosFactores | null>(null);
	// Los códigos solo existen en claro en esta respuesta: se muestran una vez.
	const [codigos, setCodigos] = useState<string[] | null>(null);
	const [dialogo, setDialogo] = useState<"desactivar" | "regenerar" | null>(
		null,
	);

	const contenido = () => {
		if (codigos) {
			return (
				<CodigosRecuperacion
					codigos={codigos}
					onCerrar={() => setCodigos(null)}
				/>
			);
		}
		if (estado?.activo) {
			return (
				<div className="space-y-4">
					<p className="text-sm text-tinta-suave">
						Te quedan <strong>{estado.codigosRestantes}</strong> códigos de
						recuperación sin usar.
					</p>
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" onClick={() => setDialogo("regenerar")}>
							Generar códigos nuevos
						</Button>
						<Button
							variant="outline"
							className="text-peligro-tinta"
							onClick={() => setDialogo("desactivar")}
						>
							<ShieldOff />
							Desactivar
						</Button>
					</div>
				</div>
			);
		}
		if (alta) {
			return (
				<div className="grid gap-6 sm:grid-cols-[auto_1fr]">
					<div className="space-y-2">
						<CodigoQr
							texto={alta.otpauthUri}
							etiqueta="Código QR para la app de autenticación"
						/>
						<p className="max-w-44 text-xs text-tinta-tenue">
							¿No puedes escanearlo? Introduce esta clave:
							<code className="mt-1 block break-all font-mono text-tinta">
								{alta.secreto}
							</code>
						</p>
					</div>
					<div className="space-y-3">
						<p className="text-sm text-tinta-suave">
							1. Escanea el QR con tu app. 2. Escribe el código de 6 dígitos que
							muestra.
						</p>
						<CodigoForm
							textoBoton="Activar"
							onEnviar={async (codigo) => {
								const { codigosRecuperacion } =
									await activar.mutateAsync(codigo);
								setAlta(null);
								setCodigos(codigosRecuperacion);
								toast.success("Verificación en dos pasos activada");
							}}
						/>
						<Button variant="ghost" size="sm" onClick={() => setAlta(null)}>
							Cancelar
						</Button>
					</div>
				</div>
			);
		}
		if (!estado) return null;
		return (
			<Button
				onClick={() => iniciar.mutate(undefined, { onSuccess: setAlta })}
				isLoading={iniciar.isPending}
			>
				<Smartphone />
				Activar
			</Button>
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					Verificación en dos pasos
					{estado?.activo && <Badge variant="success">Activada</Badge>}
				</CardTitle>
				<CardDescription>
					Además de la contraseña, pide un código de una app de autenticación
					(Google Authenticator, Authy, 1Password…).
				</CardDescription>
			</CardHeader>

			{isLoading && <Skeleton className="h-9 w-40" />}

			{contenido()}

			<Dialog
				abierto={dialogo === "regenerar"}
				onCerrar={() => setDialogo(null)}
				titulo="Generar códigos de recuperación nuevos"
				descripcion="Los anteriores dejarán de funcionar."
			>
				<CodigoForm
					textoBoton="Generar"
					onEnviar={async (codigo) => {
						const { codigosRecuperacion } = await regenerar.mutateAsync(codigo);
						setDialogo(null);
						setCodigos(codigosRecuperacion);
					}}
				/>
			</Dialog>

			<Dialog
				abierto={dialogo === "desactivar"}
				onCerrar={() => setDialogo(null)}
				titulo="Desactivar la verificación en dos pasos"
				descripcion="Tu cuenta quedará protegida solo por la contraseña."
			>
				<DesactivarForm onHecho={() => setDialogo(null)} />
			</Dialog>
		</Card>
	);
}

function CodigosRecuperacion({
	codigos,
	onCerrar,
}: {
	codigos: string[];
	onCerrar: () => void;
}) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-tinta-suave">
				Guarda estos códigos en un lugar seguro. Cada uno sirve{" "}
				<strong>una sola vez</strong> si pierdes el móvil, y no volverás a
				verlos.
			</p>
			<ul className="grid grid-cols-2 gap-2 rounded-lg border border-borde bg-elevada p-4 font-mono text-sm">
				{codigos.map((codigo) => (
					<li key={codigo}>{codigo}</li>
				))}
			</ul>
			<div className="flex flex-wrap gap-2">
				<Button
					variant="outline"
					onClick={() =>
						navigator.clipboard
							.writeText(codigos.join("\n"))
							.then(() => toast.success("Códigos copiados"))
					}
				>
					<Copy />
					Copiar
				</Button>
				<Button onClick={onCerrar}>
					<ShieldCheck />
					Ya los he guardado
				</Button>
			</div>
		</div>
	);
}

function DesactivarForm({ onHecho }: { onHecho: () => void }) {
	const desactivar = useDesactivarDosFactoresMutation();
	const form = useAppForm({
		defaultValues: { password: "", codigo: "" } as DesactivarDosFactoresInput,
		validators: { onSubmit: desactivarDosFactoresSchema },
		onSubmit: async ({ value }) => {
			const { mensaje } = await desactivar.mutateAsync(value);
			toast.success(mensaje);
			onHecho();
		},
	});

	return (
		<form.AppForm>
			<form.Formulario className="space-y-4">
				<form.AppField name="password">
					{(campo) => (
						<campo.CampoTexto
							label="Contraseña"
							type="password"
							autoComplete="current-password"
						/>
					)}
				</form.AppField>
				<form.AppField name="codigo">
					{(campo) => (
						<campo.CampoTexto
							label="Código de la app o de recuperación"
							autoComplete="one-time-code"
						/>
					)}
				</form.AppField>
				<form.BotonEnviar className="w-full" variant="danger">
					Desactivar
				</form.BotonEnviar>
			</form.Formulario>
		</form.AppForm>
	);
}
