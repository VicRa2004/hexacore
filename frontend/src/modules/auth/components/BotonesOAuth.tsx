import { Button } from "@/core/components/ui/Button";
import {
	useIrAProveedorMutation,
	useProveedoresOAuthQuery,
} from "../hooks/useOAuth";
import { NOMBRE_PROVEEDOR } from "../utils/proveedoresOAuth";

/** Login/registro con Google o GitHub. No aparece si el backend no tiene ninguno configurado. */
export function BotonesOAuth() {
	const { data: proveedores = [] } = useProveedoresOAuthQuery();
	const ir = useIrAProveedorMutation("iniciar");

	if (proveedores.length === 0) return null;

	return (
		<div className="mt-6 space-y-3">
			<div className="flex items-center gap-3 text-xs text-tinta-tenue">
				<span className="h-px flex-1 bg-borde" />o continúa con
				<span className="h-px flex-1 bg-borde" />
			</div>
			<div className="grid grid-cols-2 gap-2">
				{proveedores.map((proveedor) => (
					<Button
						key={proveedor}
						variant="outline"
						className="w-full"
						// Sigue cargando mientras el navegador sale hacia el proveedor.
						isLoading={ir.isPending && ir.variables === proveedor}
						disabled={ir.isPending}
						onClick={() => ir.mutate(proveedor)}
					>
						{NOMBRE_PROVEEDOR[proveedor]}
					</Button>
				))}
			</div>
		</div>
	);
}
