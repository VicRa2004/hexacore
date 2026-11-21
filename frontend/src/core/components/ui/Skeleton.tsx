import type { HTMLAttributes } from "react";
import { cn } from "@/core/utils/cn";

/** Hueco gris animado mientras carga; dale tamaño con `className` (`h-4 w-32`). */
export function Skeleton({
	className,
	...props
}: HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			aria-hidden
			className={cn("animate-pulse rounded-md bg-elevada", className)}
			{...props}
		/>
	);
}
