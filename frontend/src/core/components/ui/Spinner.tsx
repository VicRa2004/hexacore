import type { HTMLAttributes } from "react";
import { cn } from "@/core/utils/cn";

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
	const sizeClasses = {
		sm: "h-4 w-4 border-2",
		md: "h-6 w-6 border-2",
		lg: "h-8 w-8 border-3",
	};

	return (
		<div
			role="status"
			aria-label="Cargando..."
			className={cn(
				"animate-spin rounded-full border-solid border-current border-t-transparent",
				sizeClasses[size],
				className,
			)}
			{...props}
		>
			<span className="sr-only">Cargando...</span>
		</div>
	);
}
