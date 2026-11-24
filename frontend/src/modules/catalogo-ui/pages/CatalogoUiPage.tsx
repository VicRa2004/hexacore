import { BarraCatalogo } from "../components/BarraCatalogo";
import { SeccionControles } from "../components/SeccionControles";
import { SeccionFormularios } from "../components/SeccionFormularios";
import { SeccionSuperficies } from "../components/SeccionSuperficies";
import { SeccionTabla } from "../components/SeccionTabla";
import { SeccionTokens } from "../components/SeccionTokens";

/** Página solo de desarrollo (/ui) con todas las primitivas, estados y patrones de formulario. */
export function CatalogoUiPage() {
	return (
		<div className="min-h-screen bg-fondo text-tinta">
			<BarraCatalogo />
			<main className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6">
				<SeccionTokens />
				<SeccionControles />
				<SeccionSuperficies />
				<SeccionTabla />
				<SeccionFormularios />
			</main>
		</div>
	);
}
