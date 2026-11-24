import { KeyRound, UserRound } from "lucide-react";
import { useState } from "react";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Tabs } from "@/core/components/ui/Tabs";
import { AvisoVerificacionEmail } from "@/modules/auth/components/AvisoVerificacionEmail";
import { CambiarPasswordForm } from "@/modules/auth/components/CambiarPasswordForm";
import { CuentasVinculadasCard } from "@/modules/auth/components/CuentasVinculadasCard";
import { DosFactoresCard } from "@/modules/auth/components/DosFactoresCard";
import { SesionesCard } from "@/modules/auth/components/SesionesCard";
import { PerfilUsuarioCard } from "../components/PerfilUsuarioCard";

export function PerfilPage() {
	const [pestana, setPestana] = useState<"cuenta" | "seguridad">("cuenta");

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<Encabezado
				titulo="Mi perfil"
				descripcion="Tus datos, tu contraseña y los dispositivos con sesión abierta."
			/>
			<AvisoVerificacionEmail />
			<Tabs
				etiqueta="Secciones del perfil"
				activa={pestana}
				onCambio={setPestana}
				pestanas={[
					{
						clave: "cuenta",
						etiqueta: (
							<>
								<UserRound />
								Cuenta
							</>
						),
						contenido: <PerfilUsuarioCard />,
					},
					{
						clave: "seguridad",
						etiqueta: (
							<>
								<KeyRound />
								Seguridad
							</>
						),
						contenido: (
							<div className="space-y-6">
								<CambiarPasswordForm />
								<DosFactoresCard />
								<CuentasVinculadasCard />
								<SesionesCard />
							</div>
						),
					},
				]}
			/>
		</div>
	);
}
