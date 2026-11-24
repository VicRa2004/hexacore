import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Spinner } from "@/core/components/ui/Spinner";

const CatalogoUiPage = import.meta.env.DEV
	? lazy(() =>
			import("@/modules/catalogo-ui/pages/CatalogoUiPage").then((m) => ({
				default: m.CatalogoUiPage,
			})),
		)
	: null;

export const Route = createFileRoute("/ui")({
	beforeLoad: () => {
		if (!import.meta.env.DEV) {
			throw notFound();
		}
	},
	staticData: { titulo: "Catálogo UI" },
	component: RutaCatalogoUi,
});

function RutaCatalogoUi() {
	if (!CatalogoUiPage) return null;
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center bg-fondo">
					<Spinner size="lg" className="text-acento" />
				</div>
			}
		>
			<CatalogoUiPage />
		</Suspense>
	);
}
