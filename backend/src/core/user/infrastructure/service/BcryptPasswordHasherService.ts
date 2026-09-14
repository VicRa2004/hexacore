import { injectable } from "tsyringe";
import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";

const SALT_ROUNDS = 10;

@injectable()
export class BcryptPasswordHasherService implements PasswordHasher {
	async hash(plainPassword: string): Promise<string> {
		return bcrypt.hash(plainPassword, SALT_ROUNDS);
	}

	async compare(
		plainPassword: string,
		hashedPassword: string,
	): Promise<boolean> {
		return bcrypt.compare(plainPassword, hashedPassword);
	}
}
