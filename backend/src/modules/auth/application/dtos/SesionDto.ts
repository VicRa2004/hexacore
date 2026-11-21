export interface SesionDto {
	id: number;
	userAgent: string | null;
	ultimoUso: string;
	expiraEn: string;
	/** La sesión desde la que se hace la petición (la de la cookie). */
	actual: boolean;
}
