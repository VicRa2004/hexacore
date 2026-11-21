import { useState } from "react";
import { cn } from "@/core/utils/cn";

export interface AvatarProps {
	nombre: string;
	src?: string | null;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const TAMANOS = {
	sm: "size-7 text-[11px]",
	md: "size-9 text-xs",
	lg: "size-16 text-lg",
};

function iniciales(nombre: string) {
	const partes = nombre.trim().split(/\s+/);
	return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** Foto del usuario o, si no hay (o falla al cargar), sus iniciales. */
export function Avatar({ nombre, src, size = "md", className }: AvatarProps) {
	const [fallo, setFallo] = useState<string | null>(null);
	const clases = cn(
		"inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-acento-borde bg-acento-suave font-semibold text-acento-tinta",
		TAMANOS[size],
		className,
	);

	if (src && fallo !== src) {
		return (
			<img
				src={src}
				alt={nombre}
				onError={() => setFallo(src)}
				className={cn(clases, "object-cover")}
			/>
		);
	}
	return (
		<span role="img" aria-label={nombre} className={clases}>
			{iniciales(nombre)}
		</span>
	);
}
