import type { AuthResponse, paths, UserDto } from "@/core/api/schema.gen";

export type { AuthResponse };
export type User = UserDto;

// El refresh token vive en una cookie httpOnly que gestiona el backend.
export type AuthTokens =
	paths["/api/auth/refresh"]["post"]["responses"][200]["content"]["application/json"];

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	login: (payload: AuthResponse) => void;
	setTokens: (tokens: AuthTokens) => void;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
}
