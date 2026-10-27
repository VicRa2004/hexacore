export interface UsuarioDto {
	id: number;
	nombre: string;
	email: string;
	isActivo: boolean;
	roles: string[];
	emailVerificado: boolean;
	avatarUrl: string | null;
}
