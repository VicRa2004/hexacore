export interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
}

// El refresh token vive en una cookie httpOnly que gestiona el backend.
export interface AuthTokens {
	accessToken: string;
}

export interface AuthResponse {
	accessToken: string;
	user: User;
}

export interface AuthState {
	user: User | null;
	accessToken: string | null;
	isAuthenticated: boolean;
	login: (payload: AuthResponse) => void;
	setTokens: (tokens: AuthTokens) => void;
	logout: () => void;
	updateUser: (userData: Partial<User>) => void;
}
