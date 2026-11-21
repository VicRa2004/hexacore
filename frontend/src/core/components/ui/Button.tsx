import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/core/utils/cn";
import { Spinner } from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			children,
			className,
			variant = "primary",
			size = "md",
			isLoading = false,
			disabled,
			type = "button",
			...props
		},
		ref,
	) => {
		const baseStyles =
			"inline-flex shrink-0 items-center justify-center font-medium rounded-md transition-[color,background-color,border-color,box-shadow,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acento focus-visible:ring-offset-2 focus-visible:ring-offset-fondo disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none [&_svg]:size-4 [&_svg]:shrink-0";

		const variants = {
			primary: "bg-acento text-sobre-acento hover:bg-acento-hover shadow-sm",
			secondary: "bg-elevada text-tinta hover:bg-borde border border-borde",
			outline:
				"border border-borde bg-superficie text-tinta shadow-sm hover:bg-elevada hover:border-borde-fuerte",
			danger: "bg-peligro text-sobre-acento hover:bg-peligro-hover shadow-sm",
			ghost:
				"bg-transparent text-tinta-suave hover:bg-elevada hover:text-tinta",
		};

		const sizes = {
			sm: "h-8 text-xs px-2.5 gap-1.5",
			md: "h-9 text-sm px-3.5 gap-2",
			lg: "h-11 text-base px-5 gap-2.5",
		};

		return (
			<button
				ref={ref}
				type={type}
				disabled={disabled || isLoading}
				className={cn(baseStyles, variants[variant], sizes[size], className)}
				{...props}
			>
				{isLoading && <Spinner size="sm" className="text-current" />}
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";
