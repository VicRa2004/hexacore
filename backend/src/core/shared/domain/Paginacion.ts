export interface Paginacion<T> {
	datos: T[];
	pagina: number;
	totalElementos: number;
	totalPaginas: number;
}
