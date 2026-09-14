import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import { env } from "../../../../core/config/env";
import type { TokenService } from "../../domain/service/TokenService";
import crypto from "node:crypto";

@injectable()
export class JwtService implements TokenService {
	private secret = env.JWT_SECRET;

	generateToken(payload: object, expiresIn: string = "15m"): string {
		return jwt.sign(payload, this.secret, { expiresIn: expiresIn as any });
	}

	verifyToken(token: string): object | string {
		return jwt.verify(token, this.secret);
	}

	generateRefreshToken(): string {
		return crypto.randomBytes(48).toString("hex");
	}

	hashRefreshToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}
