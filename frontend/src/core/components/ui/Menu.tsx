import {
	type ButtonHTMLAttributes,
	type CSSProperties,
	type ReactNode,
	useId,
	useRef,
} from "react";
import { cn } from "@/core/utils/cn";

export interface MenuProps {
	/** Contenido del botón que abre el menú. */
	disparador: ReactNode;
	etiqueta: string;
	children: ReactNode;
	className?: string;
	/** Clases del botón disparador. */
	claseDisparador?: string;
}

/**
 * Menú desplegable sobre la Popover API nativa: capa superior, cierre con Esc y
 * clic fuera sin JS. Se posiciona junto a su botón con CSS anchor positioning.
 */
export function Menu({
	disparador,
	etiqueta,
	children,
	className,
	claseDisparador,
}: MenuProps) {
	const id = `menu-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
	const ancla = { "--ancla": `--${id}` } as CSSProperties;

	return (
		<>
			<button
				type="button"
				popoverTarget={id}
				aria-label={etiqueta}
				style={ancla}
				className={cn(
					"[anchor-name:var(--ancla)] inline-flex cursor-pointer items-center rounded-md transition-colors hover:bg-elevada focus-visible:outline-2 focus-visible:outline-acento",
					claseDisparador,
				)}
			>
				{disparador}
			</button>
			<div
				id={id}
				popover="auto"
				style={ancla}
				className={cn(
					"[position-anchor:var(--ancla)] [position-area:block-end_span-inline-start] [position-try-fallbacks:flip-block,flip-inline] inset-auto m-0 mt-1.5 w-72 rounded-lg border border-borde bg-superficie p-1 text-tinta shadow-flotante open:animar-entrada",
					className,
				)}
			>
				{children}
			</div>
		</>
	);
}

/** Opción del menú: cierra el popover al pulsarla. */
export function MenuOpcion({
	className,
	peligro,
	onClick,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { peligro?: boolean }) {
	const ref = useRef<HTMLButtonElement>(null);
	return (
		<button
			ref={ref}
			type="button"
			onClick={(e) => {
				onClick?.(e);
				ref.current?.closest<HTMLElement>("[popover]")?.hidePopover();
			}}
			className={cn(
				"flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors [&_svg]:size-4 [&_svg]:text-tinta-tenue",
				peligro
					? "text-peligro-tinta hover:bg-peligro-suave [&_svg]:text-peligro-tinta"
					: "text-tinta-suave hover:bg-elevada hover:text-tinta",
				className,
			)}
			{...props}
		/>
	);
}

export function MenuSeparador() {
	return <hr className="-mx-1 my-1 border-borde" />;
}
