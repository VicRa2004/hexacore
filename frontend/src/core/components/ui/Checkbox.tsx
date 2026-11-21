import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/core/utils/cn";

export interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	label: ReactNode;
	error?: string;
}

/** Casilla nativa con su etiqueta clicable. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, error, className, ...props }, ref) => (
		<div className="space-y-1">
			<label
				className={cn(
					"flex cursor-pointer items-center gap-2 text-sm text-tinta",
					props.disabled && "cursor-not-allowed opacity-50",
					className,
				)}
			>
				<input
					ref={ref}
					type="checkbox"
					aria-invalid={!!error}
					className="h-4 w-4 cursor-pointer accent-acento focus-visible:outline-2 focus-visible:outline-acento"
					{...props}
				/>
				{label}
			</label>
			{error && (
				<p className="text-xs font-medium text-peligro-tinta">{error}</p>
			)}
		</div>
	),
);

Checkbox.displayName = "Checkbox";
