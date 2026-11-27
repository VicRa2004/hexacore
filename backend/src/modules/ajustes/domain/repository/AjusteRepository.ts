export interface EntradaAjuste {
	clave: string;
	valor: unknown;
}

export interface AjusteRepository {
	obtenerTodos(): Promise<Map<string, unknown>>;
	guardarVarios(entradas: EntradaAjuste[]): Promise<void>;
	eliminar(clave: string): Promise<void>;
}
