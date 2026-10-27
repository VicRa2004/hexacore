import jwt from "jsonwebtoken";
import { env } from "../../../../core/config/env";
import type {
	AccessTokenPayload,
	TokenService,
} from "../../domain/service/TokenService";
import crypto from "node:crypto";

export class JwtService implements TokenService {
	private secreto = env.JWT_SECRET;

	generarToken(payload: AccessTokenPayload): string {
		return jwt.sign(payload, this.secreto, {
			algorithm: "HS256",
			expiresIn: "15m",
		});
	}

	verificarToken(token: string): AccessTokenPayload {
		// Fijar el algoritmo evita aceptar tokens firmados con otro (p.ej. "none").
		// La firma garantiza que el payload es el que emitió generarToken.
		return jwt.verify(token, this.secreto, {
			algorithms: ["HS256"],
		}) as AccessTokenPayload;
	}

	generarRefreshToken(): string {
		return crypto.randomBytes(48).toString("hex");
	}

	hashearRefreshToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}
}
