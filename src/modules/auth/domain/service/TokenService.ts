export interface TokenService {
  generateToken(payload: object, expiresIn?: string): string;
  verifyToken(token: string): object | string;
}
