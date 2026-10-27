import type { Usuario } from "../../domain/Usuario";
import type { UsuarioDto } from "../dtos/UsuarioDto";

export const UsuarioMapper = {
	toDto(usuario: Usuario): UsuarioDto {
		return {
			id: usuario.getId(),
			nombre: usuario.getNombre(),
			email: usuario.getEmail(),
			isActivo: usuario.getIsActivo(),
			roles: usuario.getRoles(),
			emailVerificado: usuario.getEmailVerificado(),
		};
	},
};
