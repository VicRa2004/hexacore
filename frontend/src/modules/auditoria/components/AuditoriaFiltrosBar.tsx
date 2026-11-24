import { Search, X } from "lucide-react";
import { usePermisos } from "@/core/auth/permisos";
import { Button } from "@/core/components/ui/Button";
import { Input } from "@/core/components/ui/Input";
import { Select } from "@/core/components/ui/Select";
import { useUsuariosQuery } from "@/modules/usuarios/hooks/useUsuariosQuery";

interface AuditoriaFiltrosBarProps {
	evento: string;
	onEventoChange: (valor: string) => void;
	usuarioId?: number;
	onUsuarioIdChange: (valor: number | undefined) => void;
	desde?: string;
	onDesdeChange: (valor: string | undefined) => void;
	hasta?: string;
	onHastaChange: (valor: string | undefined) => void;
	onLimpiar: () => void;
	hayFiltrosActivos: boolean;
}

export function AuditoriaFiltrosBar({
	evento,
	onEventoChange,
	usuarioId,
	onUsuarioIdChange,
	desde,
	onDesdeChange,
	hasta,
	onHastaChange,
	onLimpiar,
	hayFiltrosActivos,
}: AuditoriaFiltrosBarProps) {
	const { puede } = usePermisos();
	const puedeLeerUsuarios = puede("usuarios:leer");
	const { data: usuariosPagina } = useUsuariosQuery(
		{ pagina: 1, limite: 100 },
		{ enabled: puedeLeerUsuarios },
	);

	const usuarios = usuariosPagina?.datos ?? [];
	const usuarioFaltanteEnLista =
		usuarioId !== undefined && !usuarios.some((u) => u.id === usuarioId);

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end">
			<div className="relative w-full lg:w-64">
				<Input
					type="search"
					label="Evento"
					aria-label="Filtrar por evento"
					placeholder="Filtrar por evento…"
					value={evento}
					onChange={(e) => onEventoChange(e.target.value)}
					className="pl-9"
				/>
				<Search className="pointer-events-none absolute bottom-2.5 left-3 size-4 text-tinta-tenue" />
			</div>

			<div className="w-full lg:w-60">
				{puedeLeerUsuarios ? (
					<Select
						label="Usuario"
						aria-label="Filtrar por usuario"
						value={usuarioId ? String(usuarioId) : ""}
						onChange={(e) => {
							const val = e.target.value;
							onUsuarioIdChange(val ? Number(val) : undefined);
						}}
					>
						<option value="">Todos los usuarios</option>
						{usuarioFaltanteEnLista && (
							<option value={String(usuarioId)}>Usuario #{usuarioId}</option>
						)}
						{usuarios.map((u) => (
							<option key={u.id} value={String(u.id)}>
								{u.nombre} ({u.email})
							</option>
						))}
					</Select>
				) : (
					<Input
						type="number"
						min={1}
						label="ID de usuario"
						aria-label="Filtrar por ID de usuario"
						placeholder="ID de usuario…"
						value={usuarioId ?? ""}
						onChange={(e) => {
							const parsed = Number.parseInt(e.target.value, 10);
							onUsuarioIdChange(
								Number.isInteger(parsed) && parsed > 0 ? parsed : undefined,
							);
						}}
					/>
				)}
			</div>

			<div className="w-full lg:w-44">
				<Input
					type="date"
					label="Desde"
					aria-label="Desde"
					value={desde ?? ""}
					max={hasta}
					onChange={(e) => onDesdeChange(e.target.value || undefined)}
				/>
			</div>

			<div className="w-full lg:w-44">
				<Input
					type="date"
					label="Hasta"
					aria-label="Hasta"
					value={hasta ?? ""}
					min={desde}
					onChange={(e) => onHastaChange(e.target.value || undefined)}
				/>
			</div>

			{hayFiltrosActivos && (
				<Button
					variant="ghost"
					onClick={onLimpiar}
					className="w-full lg:w-auto"
				>
					<X />
					Limpiar filtros
				</Button>
			)}
		</div>
	);
}
