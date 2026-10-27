import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryClient } from "@/core/router";
import type { AuthResponse, AuthState, AuthTokens, Usuario } from "./types";

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			usuario: null,
			accessToken: null,
			isAuthenticated: false,

			login: (payload: AuthResponse) => {
				set({
					usuario: payload.usuario,
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
					usuario: null,
					accessToken: null,
					isAuthenticated: false,
				});
				// Evita que el siguiente usuario vea datos cacheados del anterior.
				queryClient.clear();
			},

			actualizarUsuario: (datosUsuario: Partial<Usuario>) => {
				set((state) => ({
					usuario: state.usuario ? { ...state.usuario, ...datosUsuario } : null,
				}));
			},
		}),
		{
			name: "hexacore-auth-storage",
			// v2: `user` pasó a `usuario` (v1: `role` a `roles`); las sesiones anteriores se descartan.
			version: 2,
			migrate: () => ({
				usuario: null,
				accessToken: null,
				isAuthenticated: false,
			}),
			// Persistir sólo la sesión (descarta el refreshToken de versiones previas).
			partialize: ({ usuario, accessToken, isAuthenticated }) => ({
				usuario,
				accessToken,
				isAuthenticated,
			}),
		},
	),
);
