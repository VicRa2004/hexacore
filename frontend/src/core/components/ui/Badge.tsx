import type { HTMLAttributes } from "react";
import { cn } from "@/core/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
	variant?: "default" | "success" | "warning" | "danger" | "accent";
}

export function Badge({
	className,
	variant = "default",
	children,
	...props
}: BadgeProps) {
	const variants = {
		default: "bg-elevada text-tinta-suave border-borde",
		success: "bg-exito-suave text-exito-tinta border-exito-borde",
		warning: "bg-aviso-suave text-aviso-tinta border-aviso-borde",
		danger: "bg-peligro-suave text-peligro-tinta border-peligro-borde",
		accent: "bg-acento-suave text-acento-tinta border-acento-borde",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
}
