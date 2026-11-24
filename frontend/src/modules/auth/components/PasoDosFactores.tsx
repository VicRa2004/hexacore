import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/core/api/client";
import type { AuthResponse } from "@/core/auth/types";
import { Button } from "@/core/components/ui/Button";
import { authApi } from "../api/authApi";
import { CodigoForm } from "./CodigoForm";

/** Segundo paso del login (contraseña u OAuth) cuando el usuario tiene 2FA. */
export function PasoDosFactores({
	token2fa,
	onEntrar,
	onVolver,
}: {
	token2fa: string;
	onEntrar: (response: AuthResponse) => void;
	onVolver: () => void;
}) {
	return (
		<div className="space-y-4">
			<p className="text-sm text-tinta-suave">
				Introduce el código de tu app de autenticación o uno de tus códigos de
				recuperación.
			</p>
			<CodigoForm
				textoBoton={
					<>
						<ShieldCheck className="h-4 w-4 mr-1.5" />
						Verificar
					</>
				}
				onEnviar={async (codigo) => {
					try {
						onEntrar(await authApi.loginDosFactores({ token2fa, codigo }));
					} catch (error: unknown) {
						toast.error(getErrorMessage(error));
					}
				}}
			/>
			<Button variant="ghost" size="sm" className="w-full" onClick={onVolver}>
				Volver
			</Button>
		</div>
	);
}
