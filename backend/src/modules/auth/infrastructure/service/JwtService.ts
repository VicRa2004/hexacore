import jwt from "jsonwebtoken";
import { env } from "../../../../core/config/env";
import type {
	AccessTokenPayload,
	TokenService,
} from "../../domain/service/TokenService";
import crypto from "node:crypto";

export class JwtService implements TokenService {
	private secret = env.JWT_SECRET;

	generateToken(payload: AccessTokenPayload): string {
		return jwt.sign(payload, this.secret, {
			algorithm: "HS256",
			expiresIn: "15m",
		});
	}

	verifyToken(token: string): AccessTokenPayload {
		// Fijar el algoritmo evita aceptar tokens firmados con otro (p.ej. "none").
		// La firma garantiza que el payload es el que emitió generateToken.
		return jwt.verify(token, this.secret, {
			algorithms: ["HS256"],
		}) as AccessTokenPayload;
	}

	generateRefreshToken(): string {
		return crypto.randomBytes(48).toString("hex");
	}

	hashRefreshToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}
