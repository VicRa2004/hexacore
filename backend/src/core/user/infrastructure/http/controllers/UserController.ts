import type { Context } from "hono";
import type { CreateUserUseCase } from "../../../application/useCases/CreateUserUseCase";
import type { DeleteUserUseCase } from "../../../application/useCases/DeleteUserUseCase";
import type { GetAllUsersUseCase } from "../../../application/useCases/GetAllUsersUseCase";
import type { GetOneUserUseCase } from "../../../application/useCases/GetOneUserUseCase";
import type { UpdateUserUseCase } from "../../../application/useCases/UpdateUserUseCase";
import {
	createUserSchema,
	getAllUsersSchema,
	updateUserSchema,
	userIdSchema,
} from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

export class UserController extends BaseController {
	// Objeto con nombres y no posicional: varios casos de uso tienen la misma forma (`run(id)`).
	constructor(
		private readonly useCases: {
			create: CreateUserUseCase;
			getAll: GetAllUsersUseCase;
			getOne: GetOneUserUseCase;
			update: UpdateUserUseCase;
			delete: DeleteUserUseCase;
		},
	) {
		super();
	}

	create = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(createUserSchema, await c.req.json());
			return this.created(c, await this.useCases.create.run(dto));
		});

	getAll = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(getAllUsersSchema, c.req.query());
			return this.ok(c, await this.useCases.getAll.run(dto));
		});

	getOne = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(userIdSchema, c.req.param());
			return this.ok(c, await this.useCases.getOne.run(id));
		});

	update = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(userIdSchema, c.req.param());
			const dto = validate(updateUserSchema, await c.req.json());
			return this.ok(c, await this.useCases.update.run(id, dto));
		});

	delete = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(userIdSchema, c.req.param());
			await this.useCases.delete.run(id);
			return c.body(null, 204);
		});
}
