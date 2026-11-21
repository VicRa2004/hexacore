import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/core/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, className, id, ...props }, ref) => {
		const inputId =
			id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

		return (
			<div className="w-full space-y-1.5">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-sm font-medium text-tinta-suave"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						"w-full h-9 rounded-md border bg-superficie px-3 text-sm text-tinta placeholder:text-tinta-tenue shadow-sm transition-colors",
						"focus:outline-none focus:ring-3 focus:ring-acento/20 focus:border-acento",
						"disabled:cursor-not-allowed disabled:opacity-50",
						error
							? "border-peligro focus:border-peligro focus:ring-peligro/20"
							: "border-borde hover:border-borde-fuerte",
						className,
					)}
					aria-invalid={!!error}
					aria-describedby={
						error
							? `${inputId}-error`
							: helperText
								? `${inputId}-helper`
								: undefined
					}
					{...props}
				/>
				{error && (
					<p
						id={`${inputId}-error`}
						className="text-xs text-peligro-tinta font-medium"
					>
						{error}
					</p>
				)}
				{!error && helperText && (
					<p id={`${inputId}-helper`} className="text-xs text-tinta-tenue">
						{helperText}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";
