import jwt from "jsonwebtoken";
import { injectable } from "tsyringe";
import type { TokenService } from "../../domain/service/TokenService";

@injectable()
export class JwtService implements TokenService {
  private secret = process.env.JWT_SECRET || "default_secret";

  generateToken(payload: object, expiresIn: string = "1d"): string {
    return jwt.sign(payload, this.secret, { expiresIn: expiresIn as any });
  }

  verifyToken(token: string): object | string {
    return jwt.verify(token, this.secret);
  }
}
