import type { EventBus } from "@/core/shared/domain/events/EventBus";
import { inject, injectable } from "tsyringe";
import type { CreateUserEvent } from "../../domain/event/CreateUserEvent";

@injectable()
export class SendWelcomeEmail {
	constructor(@inject("EventBus") private readonly eventBus: EventBus) {}

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
