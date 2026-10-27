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
			// La clave cambia con cada subida: la URL nueva invalida la caché del navegador.
			avatarUrl: usuario.getAvatar()
				? `/api/avatares/${usuario.getId()}?v=${encodeURIComponent(usuario.getAvatar() ?? "")}`
				: null,
		};
	},
};
