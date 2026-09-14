import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, AuthState, AuthTokens, User } from "./types";

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,

			login: (payload: AuthResponse) => {
				set({
					user: payload.user,
					accessToken: payload.accessToken,
					refreshToken: payload.refreshToken,
					isAuthenticated: true,
				});
			},

			setTokens: (tokens: AuthTokens) => {
				set({
					accessToken: tokens.accessToken,
					refreshToken: tokens.refreshToken,
					isAuthenticated: true,
				});
			},

			logout: () => {
				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
				});
			},

			updateUser: (userData: Partial<User>) => {
				set((state) => ({
					user: state.user ? { ...state.user, ...userData } : null,
				}));
			},
		}),
		{
			name: "hexacore-auth-storage",
		},
	),
);
