import { useState } from "react";
import { useUsersQuery } from "../hooks/useUsersQuery";
import { UsersTable } from "../components/UsersTable";
import { Input } from "@/core/components/ui/Input";
import { Search, Users as UsersIcon } from "lucide-react";

export function UsersPage() {
	const [page, setPage] = useState(1);
	const [searchEmail, setSearchEmail] = useState("");

	const { data, isLoading, isError, error } = useUsersQuery({
		page,
		limit: 5,
		email: searchEmail.trim() ? searchEmail.trim() : undefined,
	});

	return (
		<div className="space-y-6">
			{/* Encabezado */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
							<UsersIcon className="h-5 w-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-white">
							Gestión de Usuarios
						</h1>
					</div>
					<p className="mt-1 text-sm text-slate-400">
						Consulta y administra los usuarios registrados en el sistema.
					</p>
				</div>

				<div className="w-full sm:w-72">
					<div className="relative">
						<Input
							type="text"
							placeholder="Buscar por email..."
							value={searchEmail}
							onChange={(e) => {
								setSearchEmail(e.target.value);
								setPage(1); // Reset a primera página al buscar
							}}
							className="pl-9"
						/>
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
					</div>
				</div>
			</div>

			{/* Tabla de Usuarios con TanStack Query */}
			<UsersTable
				users={data?.data}
				isLoading={isLoading}
				isError={isError}
				error={error}
				currentPage={page}
				totalPages={data?.totalPages ?? 1}
				onPageChange={setPage}
			/>
		</div>
	);
}
