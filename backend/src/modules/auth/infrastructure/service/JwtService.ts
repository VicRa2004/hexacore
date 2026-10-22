import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import { env } from "../../../../core/config/env";
import type { TokenService } from "../../domain/service/TokenService";
import crypto from "node:crypto";

@injectable()
export class JwtService implements TokenService {
	private secret = env.JWT_SECRET;

	generateToken(payload: object): string {
		return jwt.sign(payload, this.secret, {
			algorithm: "HS256",
			expiresIn: "15m",
		});
	}

	verifyToken(token: string): object | string {
		// Fijar el algoritmo evita aceptar tokens firmados con otro (p.ej. "none").
		return jwt.verify(token, this.secret, { algorithms: ["HS256"] });
	}

	generateRefreshToken(): string {
		return crypto.randomBytes(48).toString("hex");
	}

	hashRefreshToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}
