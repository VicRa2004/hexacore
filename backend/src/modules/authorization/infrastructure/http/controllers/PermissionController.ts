import type { Context } from "hono";
import type { CreatePermissionUseCase } from "../../../application/useCases/CreatePermissionUseCase";
import type { DeletePermissionUseCase } from "../../../application/useCases/DeletePermissionUseCase";
import type { GetAllPermissionsUseCase } from "../../../application/useCases/GetAllPermissionsUseCase";
import type { GetPermissionUseCase } from "../../../application/useCases/GetPermissionUseCase";
import type { GetUserPermissionsUseCase } from "../../../application/useCases/GetUserPermissionsUseCase";
import type { UpdatePermissionUseCase } from "../../../application/useCases/UpdatePermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import {
	createPermissionSchema,
	permissionIdSchema,
	updatePermissionSchema,
	userIdParamSchema,
} from "../schemas/permissionSchemas";

export class PermissionController extends BaseController {
	// Objeto con nombres y no posicional: varios casos de uso tienen la misma forma (`run(id)`).
	constructor(
		private readonly useCases: {
			getAll: GetAllPermissionsUseCase;
			getOne: GetPermissionUseCase;
			create: CreatePermissionUseCase;
			update: UpdatePermissionUseCase;
			delete: DeletePermissionUseCase;
			getByUser: GetUserPermissionsUseCase;
		},
	) {
		super();
	}

	getAll = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.getAll.run()),
		);

	getOne = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(permissionIdSchema, c.req.param());
			return this.ok(c, await this.useCases.getOne.run(id));
		});

	create = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(createPermissionSchema, await c.req.json());
			return this.created(c, await this.useCases.create.run(dto));
		});

	update = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(permissionIdSchema, c.req.param());
			const dto = validate(updatePermissionSchema, await c.req.json());
			return this.ok(c, await this.useCases.update.run(id, dto));
		});

	delete = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(permissionIdSchema, c.req.param());
			await this.useCases.delete.run(id);
			return c.body(null, 204);
		});

	getByUser = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { userId } = validate(userIdParamSchema, {
				userId: c.req.param("userId"),
			});
			return this.ok(c, await this.useCases.getByUser.run(userId));
		});
}
