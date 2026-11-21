import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";
import { varianteRol } from "@/core/auth/rol";
import { useAuthStore } from "@/core/auth/store";
import { Avatar } from "@/core/components/ui/Avatar";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import { Card } from "@/core/components/ui/Card";
import { useAvatarMutation } from "../hooks/useAvatarMutation";

function Dato({
	etiqueta,
	children,
}: {
	etiqueta: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1">
			<dt className="text-xs font-medium text-tinta-tenue">{etiqueta}</dt>
			<dd className="text-sm text-tinta">{children}</dd>
		</div>
	);
}

export function PerfilUsuarioCard() {
	const usuario = useAuthStore((state) => state.usuario);
	const avatar = useAvatarMutation();
	const inputArchivo = useRef<HTMLInputElement>(null);

	if (!usuario) return null;

	return (
		<Card className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
				<Avatar nombre={usuario.nombre} src={usuario.avatarUrl} size="lg" />
				<div className="min-w-0 flex-1 space-y-1.5">
					<h2 className="truncate text-lg font-semibold">{usuario.nombre}</h2>
					<div className="flex flex-wrap gap-1.5">
						<Badge variant={varianteRol(usuario.roles)}>
							{usuario.roles.join(", ")}
						</Badge>
						<Badge variant={usuario.isActivo ? "success" : "danger"}>
							{usuario.isActivo ? "Cuenta activa" : "Cuenta inactiva"}
						</Badge>
					</div>
				</div>
				<div className="flex gap-2">
					<input
						ref={inputArchivo}
						type="file"
						accept="image/png,image/jpeg,image/webp"
						className="hidden"
						aria-label="Archivo del avatar"
						onChange={(e) => {
							const archivo = e.target.files?.[0];
							if (archivo) avatar.mutate(archivo);
							e.target.value = "";
						}}
					/>
					<Button
						variant="outline"
						size="sm"
						onClick={() => inputArchivo.current?.click()}
						isLoading={avatar.isPending}
					>
						<Camera />
						{usuario.avatarUrl ? "Cambiar foto" : "Subir foto"}
					</Button>
					{usuario.avatarUrl && (
						<Button
							variant="ghost"
							size="sm"
							aria-label="Quitar foto"
							onClick={() => avatar.mutate(null)}
							disabled={avatar.isPending}
						>
							<Trash2 />
						</Button>
					)}
				</div>
			</div>

			<dl className="grid gap-5 border-t border-borde pt-6 sm:grid-cols-2">
				<Dato etiqueta="Email">
					<span className="flex flex-wrap items-center gap-2">
						{usuario.email}
						{usuario.emailVerificado === false ? (
							<Badge variant="warning">Sin verificar</Badge>
						) : (
							<Badge variant="success">Verificado</Badge>
						)}
					</span>
				</Dato>
				<Dato etiqueta="ID de usuario">
					<span className="font-mono">#{usuario.id}</span>
				</Dato>
			</dl>
		</Card>
	);
}
