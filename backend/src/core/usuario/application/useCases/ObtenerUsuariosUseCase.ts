import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import type { ObtenerUsuariosDto } from "../dtos/ObtenerUsuariosDto";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import type { Paginacion } from "@/core/shared/domain/Paginacion";
import { UsuarioMapper } from "../mappers/UsuarioMapper";

export class ObtenerUsuariosUseCase {
	constructor(private readonly usuarioRepository: UsuarioRepository) {}

	async ejecutar(dto: ObtenerUsuariosDto): Promise<Paginacion<UsuarioDto>> {
		const filtros = {
			pagina: dto.pagina,
			limite: dto.limite,
			email: dto.email,
		};

		const resultadoPaginado = await this.usuarioRepository.buscar(filtros);

		return {
			...resultadoPaginado,
			datos: resultadoPaginado.datos.map((usuario) =>
				UsuarioMapper.toDto(usuario),
			),
		};
	}
}
