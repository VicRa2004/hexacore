import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "@/core/router";
import type { AuthResponse, AuthState, AuthTokens, User } from "./types";

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			isAuthenticated: false,

			login: (payload: AuthResponse) => {
				set({
					user: payload.user,
					accessToken: payload.accessToken,
					isAuthenticated: true,
				});
			},

			setTokens: (tokens: AuthTokens) => {
				set({
					accessToken: tokens.accessToken,
					isAuthenticated: true,
				});
			},

			logout: () => {
				set({
					user: null,
					accessToken: null,
					isAuthenticated: false,
				});
				// Evita que el siguiente usuario vea datos cacheados del anterior.
				queryClient.clear();
			},

			updateUser: (userData: Partial<User>) => {
				set((state) => ({
					user: state.user ? { ...state.user, ...userData } : null,
				}));
			},
		}),
		{
			name: "hexacore-auth-storage",
			// Persistir sólo la sesión (descarta el refreshToken de versiones previas).
			partialize: ({ user, accessToken, isAuthenticated }) => ({
				user,
				accessToken,
				isAuthenticated,
			}),
		},
	),
);
