import type {
	LectorAjustes,
	ValoresAjustes,
} from "@/core/shared/domain/AjustesSistema";
import {
	crearValoresPorDefecto,
	resolverValoresAjustes,
} from "../../domain/AjustesConfig";
import type { AjusteRepository } from "../../domain/repository/AjusteRepository";

/**
 * Lee los ajustes tipados desde BD con caché en memoria y coalescencia de
 * lecturas concurrentes. Se invalida al guardar o cambiar imágenes.
 */
export class ServicioAjustes implements LectorAjustes {
	private cache: ValoresAjustes | null = null;
	private cargando: Promise<ValoresAjustes> | null = null;
	private readonly defaults: ValoresAjustes;

	constructor(
		private readonly repo: AjusteRepository,
		remitentePorDefecto: string,
	) {
		this.defaults = crearValoresPorDefecto(remitentePorDefecto);
	}

	async obtener(): Promise<ValoresAjustes> {
		if (this.cache) return this.cache;
		if (this.cargando) return this.cargando;

		const lectura = this.repo
			.obtenerTodos()
			.then((filas) => {
				const resueltos = resolverValoresAjustes(filas, this.defaults);
				// Solo cachea si no fue invalidado mientras la consulta estaba en vuelo.
				if (this.cargando === lectura) {
					this.cache = resueltos;
					this.cargando = null;
				}
				return resueltos;
			})
			.catch((err: unknown) => {
				if (this.cargando === lectura) {
					this.cargando = null;
				}
				throw err;
			});

		this.cargando = lectura;
		return lectura;
	}

	invalidar(): void {
		this.cache = null;
		this.cargando = null;
	}
}
