import { forwardRef, type SelectHTMLAttributes, useId } from "react";
import { cn } from "@/core/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	helperText?: string;
}

/** `<select>` nativo con la misma etiqueta, error y ayuda que `Input`. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, helperText, className, id, children, ...props }, ref) => {
		const generado = useId();
		const selectId = id ?? generado;
		const descripcion = error
			? `${selectId}-error`
			: helperText
				? `${selectId}-helper`
				: undefined;

		return (
			<div className="w-full space-y-1.5">
				{label && (
					<label
						htmlFor={selectId}
						className="block text-xs font-semibold uppercase tracking-wider text-tinta-suave"
					>
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={selectId}
					aria-invalid={!!error}
					aria-describedby={descripcion}
					className={cn(
						"w-full cursor-pointer rounded-lg border bg-superficie px-3 py-2 text-sm text-tinta shadow-sm transition-colors",
						"focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500",
						"disabled:cursor-not-allowed disabled:opacity-50",
						error
							? "border-rose-500/80"
							: "border-borde hover:border-borde-fuerte",
						className,
					)}
					{...props}
				>
					{children}
				</select>
				{error && (
					<p
						id={`${selectId}-error`}
						className="text-xs font-medium text-rose-400"
					>
						{error}
					</p>
				)}
				{!error && helperText && (
					<p id={`${selectId}-helper`} className="text-xs text-tinta-tenue">
						{helperText}
					</p>
				)}
			</div>
		);
	},
);

Select.displayName = "Select";
