import { DomainEvent } from "@/core/shared/domain/events/DomainEvent";

interface CreateUserEventData {
  id: number;
  email: string;
}

export class CreateUserEvent implements DomainEvent {
  eventName = "user.created";
  occurredOn: Date;
  data: CreateUserEventData;

  constructor({ email, id }: CreateUserEventData) {
    this.occurredOn = new Date();
    this.data = { id, email };
  }
}
