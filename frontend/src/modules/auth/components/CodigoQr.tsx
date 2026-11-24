import { encode } from "uqr";

/** QR en SVG (sin canvas ni imágenes externas: el secreto no sale del navegador). */
export function CodigoQr({
	texto,
	etiqueta,
}: {
	texto: string;
	etiqueta: string;
}) {
	const { data, size } = encode(texto, { border: 2 });
	const ruta = data
		.flatMap((fila, y) =>
			fila.map((negro, x) => (negro ? `M${x} ${y}h1v1h-1z` : "")),
		)
		.join("");

	return (
		<svg
			viewBox={`0 0 ${size} ${size}`}
			role="img"
			aria-label={etiqueta}
			className="size-44 rounded-lg bg-white"
			shapeRendering="crispEdges"
		>
			<path d={ruta} fill="#000" />
		</svg>
	);
}
