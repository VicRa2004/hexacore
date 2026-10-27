export interface DomainEvent {
	eventName: string;
	occurredOn: Date;
	data: unknown;
	/** Quién y en qué petición: lo rellena el bus al publicar (auditoría, logs). */
	meta?: { requestId?: string; usuarioId?: number };
}
