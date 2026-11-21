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
						className="block text-sm font-medium text-tinta-suave"
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
						"w-full cursor-pointer h-9 rounded-md border bg-superficie px-3 text-sm text-tinta shadow-sm transition-colors",
						"focus:outline-none focus:ring-3 focus:ring-acento/20 focus:border-acento",
						"disabled:cursor-not-allowed disabled:opacity-50",
						error
							? "border-peligro focus:border-peligro focus:ring-peligro/20"
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
						className="text-xs font-medium text-peligro-tinta"
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
