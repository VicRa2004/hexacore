import { Hexagon, ImagePlus, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/core/components/ui/Button";
import { Card } from "@/core/components/ui/Card";
import type { TipoImagenAjuste } from "../api/ajustesApi";
import { useImagenAjusteMutation } from "../hooks/useAjustesMutation";

interface BloqueImagenProps {
	tipo: TipoImagenAjuste;
	titulo: string;
	ayuda: string;
	accept: string;
	url: string | null;
	puedeEditar: boolean;
}

function BloqueImagen({
	tipo,
	titulo,
	ayuda,
	accept,
	url,
	puedeEditar,
}: BloqueImagenProps) {
	const mutacion = useImagenAjusteMutation(tipo);
	const inputArchivo = useRef<HTMLInputElement>(null);

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-borde bg-fondo p-4 sm:flex-row sm:items-center">
			<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-borde bg-superficie">
				{url ? (
					<img
						src={url}
						alt={titulo}
						className="size-full object-contain p-1"
					/>
				) : (
					<Hexagon className="size-5 text-acento-tinta" />
				)}
			</div>
			<div className="min-w-0 flex-1 space-y-0.5">
				<p className="text-sm font-medium text-tinta">{titulo}</p>
				<p className="text-xs text-tinta-tenue">{ayuda}</p>
			</div>
			{puedeEditar && (
				<div className="flex shrink-0 gap-2">
					<input
						ref={inputArchivo}
						type="file"
						accept={accept}
						className="hidden"
						aria-label={`Subir ${titulo.toLowerCase()}`}
						onChange={(e) => {
							const archivo = e.target.files?.[0];
							if (archivo) mutacion.mutate(archivo);
							e.target.value = "";
						}}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => inputArchivo.current?.click()}
						isLoading={mutacion.isPending}
					>
						<ImagePlus />
						{url ? "Cambiar" : "Subir"}
					</Button>
					{url && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							aria-label={`Quitar ${titulo.toLowerCase()}`}
							onClick={() => mutacion.mutate(null)}
							disabled={mutacion.isPending}
						>
							<Trash2 />
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

export function IdentidadVisualCard({
	logoUrl,
	faviconUrl,
	puedeEditar,
}: {
	logoUrl: string | null;
	faviconUrl: string | null;
	puedeEditar: boolean;
}) {
	return (
		<Card className="space-y-4">
			<div className="space-y-1">
				<h2 className="text-base font-semibold text-tinta">
					Logotipo y favicon
				</h2>
				<p className="text-xs text-tinta-tenue">
					Se muestran en la barra lateral, el login y la pestaña del navegador.
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				<BloqueImagen
					tipo="logo"
					titulo="Logo"
					ayuda="PNG, JPEG o WebP (máx. 2 MB)"
					accept="image/png,image/jpeg,image/webp"
					url={logoUrl}
					puedeEditar={puedeEditar}
				/>
				<BloqueImagen
					tipo="favicon"
					titulo="Favicon"
					ayuda="PNG, WebP o ICO (máx. 2 MB)"
					accept="image/png,image/webp,image/x-icon,.ico"
					url={faviconUrl}
					puedeEditar={puedeEditar}
				/>
			</div>
		</Card>
	);
}
