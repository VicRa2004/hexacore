import { PerfilUsuarioCard } from "../components/PerfilUsuarioCard";
import { CambiarPasswordForm } from "@/modules/auth/components/CambiarPasswordForm";
import { SeguridadCuentaCard } from "@/modules/auth/components/SeguridadCuentaCard";
import { UserCheck } from "lucide-react";

export function PerfilPage() {
	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2.5">
				<div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
					<UserCheck className="h-5 w-5" />
				</div>
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-tinta">
						Mi Perfil
					</h1>
					<p className="text-sm text-tinta-tenue">
						Información de la cuenta y detalles de la sesión activa.
					</p>
				</div>
			</div>

			<PerfilUsuarioCard />
			<SeguridadCuentaCard />
			<CambiarPasswordForm />
		</div>
	);
}
