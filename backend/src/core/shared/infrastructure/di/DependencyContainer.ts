/** Clave tipada del contenedor: `get` devuelve `T` sin casts. */
export type Token<T> = symbol & { readonly __type?: T };

export const token = <T>(name: string): Token<T> => Symbol(name) as Token<T>;

/**
 * Contenedor mínimo: solo guarda lo que se comparte entre módulos o se puede
 * sustituir (repos del núcleo, middlewares, guard, bus). Lo interno de cada
 * módulo se construye con `new` en su `module.ts`.
 */
export class DependencyContainer {
	private factories = new Map<symbol, (c: DependencyContainer) => unknown>();
	private instances = new Map<symbol, unknown>();

	/** Registrar de nuevo un token lo sustituye (así `autorizacion` pisa el guard por defecto). */
	set<T>(key: Token<T>, factory: (c: DependencyContainer) => T): void {
		this.factories.set(key, factory);
		this.instances.delete(key);
	}

	/** Resuelve en diferido y una sola vez (singleton): el orden de registro de los módulos no importa. */
	get<T>(key: Token<T>): T {
		if (!this.instances.has(key)) {
			const factory = this.factories.get(key);
			if (!factory)
				throw new Error(`Dependencia sin registrar: ${key.description}`);
			this.instances.set(key, factory(this));
		}
		return this.instances.get(key) as T;
	}
}
