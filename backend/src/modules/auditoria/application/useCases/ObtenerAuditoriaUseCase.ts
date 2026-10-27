import type { Paginacion } from "@/core/shared/domain/Paginacion";
import type {
	AuditoriaFiltros,
	AuditoriaRepository,
	RegistroAuditoria,
} from "../../domain/repository/AuditoriaRepository";

export class ObtenerAuditoriaUseCase {
	constructor(private readonly auditoria: AuditoriaRepository) {}

	ejecutar(filtros: AuditoriaFiltros): Promise<Paginacion<RegistroAuditoria>> {
		return this.auditoria.buscar(filtros);
	}
}
