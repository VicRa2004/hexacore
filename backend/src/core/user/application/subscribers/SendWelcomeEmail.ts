import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { CreateUserEvent } from "../../domain/event/CreateUserEvent";

export class SendWelcomeEmail {
	constructor(private readonly eventBus: EventBus) {}

	public setupSubscription(): void {
		this.eventBus.subscribe("user.created", (event: CreateUserEvent) => {
			this.onUserCreated(event);
		});
	}

	private onUserCreated(event: CreateUserEvent): void {
		const { email, id } = event.data;
		console.log(
			`[Email Service]: Enviando correo de bienvenida a ${email} (User ID: ${id})`,
		);
	}
}
