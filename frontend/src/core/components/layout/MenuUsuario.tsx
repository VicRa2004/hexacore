import { useNavigate } from "@tanstack/react-router";
import { Check, LogOut, Monitor, Moon, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/core/auth/store";
import { Avatar } from "@/core/components/ui/Avatar";
import { Menu, MenuOpcion, MenuSeparador } from "@/core/components/ui/Menu";
import {
	ACENTOS,
	type Acento,
	cambiarAcento,
	cambiarTema,
	type Tema,
	useAcento,
	useTema,
} from "@/core/tema";
import { cn } from "@/core/utils/cn";
import { authApi } from "@/modules/auth/api/authApi";

const TEMAS: { valor: Tema; etiqueta: string; icono: typeof Sun }[] = [
	{ valor: "claro", etiqueta: "Claro", icono: Sun },
	{ valor: "oscuro", etiqueta: "Oscuro", icono: Moon },
	{ valor: "sistema", etiqueta: "Sistema", icono: Monitor },
];

/** Avatar de la barra superior: cuenta, apariencia (tema y color) y cerrar sesión. */
export function MenuUsuario() {
	const navigate = useNavigate();
	const { usuario, logout } = useAuthStore();
	const { preferencia } = useTema();
	const acento = useAcento();

	if (!usuario) return null;

	const cerrarSesion = async () => {
		try {
			await authApi.logout();
		} catch {
			// Se limpia la sesión local aunque falle el servidor.
		} finally {
			logout();
			toast.info("Sesión cerrada correctamente");
			navigate({ to: "/login" });
		}
	};

	return (
		<Menu
			etiqueta="Menú de la cuenta"
			claseDisparador="gap-2 p-1"
			disparador={
				<Avatar nombre={usuario.nombre} src={usuario.avatarUrl} size="sm" />
			}
		>
			<div className="flex items-center gap-3 px-2.5 py-2">
				<Avatar nombre={usuario.nombre} src={usuario.avatarUrl} />
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">{usuario.nombre}</p>
					<p className="truncate text-xs text-tinta-tenue">{usuario.email}</p>
				</div>
			</div>
			<MenuSeparador />
			<MenuOpcion onClick={() => navigate({ to: "/perfil" })}>
				<UserRound />
				Mi perfil
			</MenuOpcion>
			<MenuSeparador />

			<div className="space-y-2.5 px-2.5 py-2">
				<fieldset className="space-y-2">
					<legend className="text-xs font-medium text-tinta-tenue">Tema</legend>
					<div className="grid grid-cols-3 gap-1 rounded-md bg-elevada p-0.5">
						{TEMAS.map(({ valor, etiqueta, icono: Icono }) => (
							<button
								key={valor}
								type="button"
								aria-pressed={preferencia === valor}
								onClick={() => cambiarTema(valor)}
								className={cn(
									"flex cursor-pointer items-center justify-center gap-1.5 rounded-sm py-1 text-xs transition-colors",
									preferencia === valor
										? "bg-superficie text-tinta shadow-sm"
										: "text-tinta-tenue hover:text-tinta",
								)}
							>
								<Icono className="size-3.5" />
								{etiqueta}
							</button>
						))}
					</div>
				</fieldset>
				<fieldset className="space-y-2 pt-1">
					<legend className="text-xs font-medium text-tinta-tenue">
						Color
					</legend>
					<div className="flex gap-2">
						{(Object.keys(ACENTOS) as Acento[]).map((clave) => (
							<button
								key={clave}
								type="button"
								aria-pressed={acento === clave}
								aria-label={clave}
								title={clave}
								onClick={() => cambiarAcento(clave)}
								style={{ backgroundColor: `oklch(58% 0.19 ${ACENTOS[clave]})` }}
								className="flex size-6 cursor-pointer items-center justify-center rounded-full text-sobre-acento ring-offset-2 ring-offset-superficie transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-borde-fuerte"
							>
								{acento === clave && <Check className="size-3.5" />}
							</button>
						))}
					</div>
				</fieldset>
			</div>

			<MenuSeparador />
			<MenuOpcion peligro onClick={cerrarSesion}>
				<LogOut />
				Cerrar sesión
			</MenuOpcion>
		</Menu>
	);
}
