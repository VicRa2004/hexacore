import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { fechaCompleta } from "@/core/utils/fecha";
import {
	useCuentasOAuthQuery,
	useDesvincularOAuthMutation,
	useIrAProveedorMutation,
	useProveedoresOAuthQuery,
} from "../hooks/useOAuth";
import { NOMBRE_PROVEEDOR } from "../utils/proveedoresOAuth";

/** Vincular y desvincular Google/GitHub. No aparece si el backend no tiene ninguno configurado. */
export function CuentasVinculadasCard() {
	const { data: proveedores = [] } = useProveedoresOAuthQuery();
	const { data: cuentas = [] } = useCuentasOAuthQuery();
	const vincular = useIrAProveedorMutation("vincular");
	const desvincular = useDesvincularOAuthMutation();

	if (proveedores.length === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Cuentas vinculadas</CardTitle>
				<CardDescription>
					Inicia sesión con Google o GitHub además de con tu contraseña.
				</CardDescription>
			</CardHeader>
			<ul className="divide-y divide-borde rounded-lg border border-borde">
				{proveedores.map((proveedor) => {
					const cuenta = cuentas.find((c) => c.proveedor === proveedor);
					return (
						<li key={proveedor} className="flex items-center gap-3 p-4">
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">
									{NOMBRE_PROVEEDOR[proveedor]}
								</p>
								<p className="truncate text-xs text-tinta-tenue">
									{cuenta ? (
										<span title={fechaCompleta(cuenta.vinculadaEn)}>
											{cuenta.email ?? "Vinculada"}
										</span>
									) : (
										"Sin vincular"
									)}
								</p>
							</div>
							{cuenta ? (
								<Button
									variant="outline"
									size="sm"
									className="text-peligro-tinta"
									isLoading={
										desvincular.isPending && desvincular.variables === proveedor
									}
									onClick={() => desvincular.mutate(proveedor)}
								>
									Desvincular
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									isLoading={
										vincular.isPending && vincular.variables === proveedor
									}
									disabled={vincular.isPending}
									onClick={() => vincular.mutate(proveedor)}
								>
									Vincular
								</Button>
							)}
						</li>
					);
				})}
			</ul>
		</Card>
	);
}
