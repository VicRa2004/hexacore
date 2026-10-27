import { useAuthStore } from "@/core/auth/store";
import { Badge } from "@/core/components/ui/Badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { Shield, Mail, Hash, CheckCircle, Camera, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/core/components/ui/Button";
import { useAvatarMutation } from "../hooks/useAvatarMutation";

export function PerfilUsuarioCard() {
	const usuario = useAuthStore((state) => state.usuario);
	const avatar = useAvatarMutation();
	const inputArchivo = useRef<HTMLInputElement>(null);

	if (!usuario) {
		return (
			<Card>
				<p className="text-sm text-tinta-tenue">
					No hay información de sesión activa.
				</p>
			</Card>
		);
	}

	const varianteRol = usuario.roles.includes("ADMIN")
		? "purple"
		: usuario.roles.includes("MOD")
			? "warning"
			: "default";

	return (
		<Card className="max-w-2xl mx-auto">
			<CardHeader>
				<div className="flex items-center gap-4">
					{usuario.avatarUrl ? (
						<img
							src={usuario.avatarUrl}
							alt={`Avatar de ${usuario.nombre}`}
							className="h-16 w-16 rounded-2xl border border-indigo-500/20 object-cover"
						/>
					) : (
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-xl font-bold text-indigo-400">
							{usuario.nombre.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="flex-1">
						<CardTitle>{usuario.nombre}</CardTitle>
						<CardDescription className="flex items-center gap-2 mt-1">
							<Badge variant={varianteRol}>{usuario.roles.join(", ")}</Badge>
							<Badge variant={usuario.isActivo ? "success" : "danger"}>
								{usuario.isActivo ? "Cuenta Activa" : "Cuenta Inactiva"}
							</Badge>
						</CardDescription>
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
							<Camera className="h-4 w-4" />
							{usuario.avatarUrl ? "Cambiar" : "Subir avatar"}
						</Button>
						{usuario.avatarUrl && (
							<Button
								variant="ghost"
								size="sm"
								aria-label="Quitar avatar"
								onClick={() => avatar.mutate(null)}
								disabled={avatar.isPending}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 pt-4 border-t border-borde/80">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="rounded-lg border border-borde bg-superficie/50 p-3.5">
						<div className="flex items-center gap-2 text-xs font-medium text-tinta-tenue">
							<Hash className="h-3.5 w-3.5" />
							ID de Usuario
						</div>
						<p className="mt-1 text-sm font-semibold text-tinta font-mono">
							#{usuario.id}
						</p>
					</div>

					<div className="rounded-lg border border-borde bg-superficie/50 p-3.5">
						<div className="flex items-center gap-2 text-xs font-medium text-tinta-tenue">
							<Mail className="h-3.5 w-3.5" />
							Correo Electrónico
						</div>
						<p className="mt-1 text-sm font-semibold text-tinta truncate">
							{usuario.email}
						</p>
					</div>

					<div className="rounded-lg border border-borde bg-superficie/50 p-3.5">
						<div className="flex items-center gap-2 text-xs font-medium text-tinta-tenue">
							<Shield className="h-3.5 w-3.5" />
							Nivel de Autorización
						</div>
						<p className="mt-1 text-sm font-semibold text-tinta">
							{usuario.roles.join(", ")} (Control Basado en Permisos)
						</p>
					</div>

					<div className="rounded-lg border border-borde bg-superficie/50 p-3.5">
						<div className="flex items-center gap-2 text-xs font-medium text-tinta-tenue">
							<CheckCircle className="h-3.5 w-3.5" />
							Estado de Verificación
						</div>
						{usuario.emailVerificado === false ? (
							<p className="mt-1 text-sm font-semibold text-amber-400">
								Email sin verificar
							</p>
						) : (
							<p className="mt-1 text-sm font-semibold text-emerald-400">
								Email verificado
							</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
