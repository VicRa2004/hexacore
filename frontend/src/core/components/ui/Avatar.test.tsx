import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./Avatar";

describe("Avatar", () => {
	it("debería mostrar las iniciales cuando no hay src", () => {
		const { rerender } = render(<Avatar nombre="Ana García" />);
		expect(screen.getByRole("img", { name: "Ana García" })).toHaveTextContent(
			"AG",
		);

		rerender(<Avatar nombre="Lucía" />);
		expect(screen.getByRole("img", { name: "Lucía" })).toHaveTextContent("L");

		rerender(<Avatar nombre="   " />);
		expect(screen.getByRole("img", { name: "" })).toHaveTextContent("?");
	});

	it("debería renderizar la imagen y caer a iniciales si falla la carga", () => {
		const { rerender } = render(
			<Avatar nombre="Carlos Ruiz" src="https://ejemplo.com/roto.png" />,
		);

		const imagen = screen.getByRole("img", { name: "Carlos Ruiz" });
		expect(imagen.tagName).toBe("IMG");
		expect(imagen).toHaveAttribute("src", "https://ejemplo.com/roto.png");

		fireEvent.error(imagen);

		const fallback = screen.getByRole("img", { name: "Carlos Ruiz" });
		expect(fallback.tagName).toBe("SPAN");
		expect(fallback).toHaveTextContent("CR");

		// Si cambia src a una URL distinta, debe intentar cargar la nueva imagen
		rerender(
			<Avatar nombre="Carlos Ruiz" src="https://ejemplo.com/nuevo.png" />,
		);
		const nuevaImagen = screen.getByRole("img", { name: "Carlos Ruiz" });
		expect(nuevaImagen.tagName).toBe("IMG");
		expect(nuevaImagen).toHaveAttribute("src", "https://ejemplo.com/nuevo.png");
	});
});
