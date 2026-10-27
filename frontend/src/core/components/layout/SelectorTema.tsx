import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import { cambiarTema, type Tema, useTema } from "@/core/tema";

const SIGUIENTE: Record<Tema, Tema> = {
	sistema: "claro",
	claro: "oscuro",
	oscuro: "sistema",
};
const ICONO = { sistema: Monitor, claro: Sun, oscuro: Moon };
const NOMBRE = { sistema: "del sistema", claro: "claro", oscuro: "oscuro" };

/** Alterna sistema → claro → oscuro. */
export function SelectorTema() {
	const { preferencia } = useTema();
	const Icono = ICONO[preferencia];
	const etiqueta = `Tema ${NOMBRE[preferencia]}: cambiar a ${NOMBRE[SIGUIENTE[preferencia]]}`;

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => cambiarTema(SIGUIENTE[preferencia])}
			aria-label={etiqueta}
			title={etiqueta}
		>
			<Icono className="h-4 w-4" />
		</Button>
	);
}
