import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/core/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helperText?: string;
}

/** `type="password"` añade solo el botón de mostrar/ocultar. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ label, error, helperText, className, id, type, ...props }, ref) => {
		const [visible, setVisible] = useState(false);
		const esPassword = type === "password";
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
				<div className="relative">
					<input
						ref={ref}
						id={inputId}
						type={esPassword && visible ? "text" : type}
						className={cn(
							"w-full h-9 rounded-md border bg-superficie px-3 text-sm text-tinta placeholder:text-tinta-tenue shadow-sm transition-colors",
							"focus:outline-none focus:ring-3 focus:ring-acento/20 focus:border-acento",
							"disabled:cursor-not-allowed disabled:opacity-50",
							error
								? "border-peligro focus:border-peligro focus:ring-peligro/20"
								: "border-borde hover:border-borde-fuerte",
							esPassword && "pr-10",
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
					{esPassword && (
						<button
							type="button"
							onClick={() => setVisible(!visible)}
							aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
							aria-pressed={visible}
							aria-controls={inputId}
							disabled={props.disabled}
							className="absolute inset-y-0 right-0 flex w-9 cursor-pointer items-center justify-center rounded-r-md text-tinta-tenue transition-colors hover:text-tinta focus-visible:outline-2 focus-visible:outline-acento disabled:cursor-not-allowed"
						>
							{visible ? (
								<EyeOff className="size-4" />
							) : (
								<Eye className="size-4" />
							)}
						</button>
					)}
				</div>
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
