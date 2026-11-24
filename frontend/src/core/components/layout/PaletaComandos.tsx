import { useNavigate } from "@tanstack/react-router";
import { Check, CornerDownLeft, Search } from "lucide-react";
import {
	type KeyboardEvent,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { usePermisos } from "@/core/auth/permisos";
import { useCerrarSesion } from "@/core/auth/useCerrarSesion";
import { Avatar } from "@/core/components/ui/Avatar";
import { Dialog } from "@/core/components/ui/Dialog";
import { Spinner } from "@/core/components/ui/Spinner";
import { cambiarAcento, cambiarTema, useAcento, useTema } from "@/core/tema";
import { cn } from "@/core/utils/cn";
import { useUsuariosQuery } from "@/modules/usuarios/hooks/useUsuariosQuery";
import {
	agruparComandos,
	type ComandoPaleta,
	construirComandosAcciones,
	construirComandosApariencia,
	construirComandosNavegacion,
	filtrarComandos,
} from "./comandos";

export interface PaletaComandosProps {
	abierto: boolean;
	onCerrar: () => void;
	onAlternar: () => void;
}

/** Buscador global accesible (Ctrl/Cmd+K) con navegación, acciones rápidas y usuarios por email. */
export function PaletaComandos({
	abierto,
	onCerrar,
	onAlternar,
}: PaletaComandosProps) {
	const id = useId();
	const listaId = `${id}-lista`;
	const navigate = useNavigate();
	const { puede } = usePermisos();
	const cerrarSesion = useCerrarSesion();
	const { preferencia } = useTema();
	const acento = useAcento();

	const [consulta, setConsulta] = useState("");
	const [consultaDebounced, setConsultaDebounced] = useState("");
	const [indiceActivo, setIndiceActivo] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const opcionActivaRef = useRef<HTMLButtonElement>(null);

	// Atajo global Ctrl+K / Cmd+K; evita abrirse encima de otro diálogo modal ya abierto.
	useEffect(() => {
		const manejarAtajo = (e: globalThis.KeyboardEvent) => {
			if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
			if (e.key.toLowerCase() !== "k") return;
			if (!abierto && document.querySelector("dialog[open]")) return;
			e.preventDefault();
			onAlternar();
		};
		window.addEventListener("keydown", manejarAtajo);
		return () => window.removeEventListener("keydown", manejarAtajo);
	}, [abierto, onAlternar]);

	// Al abrir enfoca el combobox; al cerrar reinicia estado.
	useEffect(() => {
		if (!abierto) {
			setConsulta("");
			setConsultaDebounced("");
			setIndiceActivo(0);
			return;
		}
		inputRef.current?.focus();
	}, [abierto]);

	// Debounce para la búsqueda remota de usuarios por email.
	useEffect(() => {
		if (!abierto) return;
		const timer = setTimeout(() => {
			setConsultaDebounced(consulta);
		}, 200);
		return () => clearTimeout(timer);
	}, [abierto, consulta]);

	const puedeLeerUsuarios = puede("usuarios:leer");
	const emailConsulta = consultaDebounced.trim();
	const buscarUsuarios =
		abierto && puedeLeerUsuarios && emailConsulta.length >= 2;
	const usuariosQuery = useUsuariosQuery(
		{ pagina: 1, limite: 5, email: emailConsulta },
		{ enabled: buscarUsuarios },
	);

	const comandosBase = useMemo(() => {
		const navegacion = construirComandosNavegacion({
			puede,
			navegar: (to) => navigate({ to }),
		});
		const acciones = construirComandosAcciones({
			puede,
			irACrearUsuario: () =>
				navigate({ to: "/usuarios", search: { accion: "crear" } }),
			irACrearRol: () =>
				navigate({ to: "/roles", search: { accion: "crear" } }),
			cerrarSesion: () => {
				void cerrarSesion();
			},
		});
		const apariencia = construirComandosApariencia({
			preferenciaTema: preferencia,
			acentoActual: acento,
			onCambiarTema: cambiarTema,
			onCambiarAcento: cambiarAcento,
		});
		return [...navegacion, ...acciones, ...apariencia];
	}, [puede, navigate, cerrarSesion, preferencia, acento]);

	const comandosUsuarios = useMemo<ComandoPaleta[]>(() => {
		if (!buscarUsuarios) return [];
		return (usuariosQuery.data?.datos ?? []).map((u) => ({
			id: `usuario-${u.id}`,
			grupo: "Usuarios",
			etiqueta: u.nombre,
			descripcion: u.email,
			avatar: { nombre: u.nombre, src: u.avatarUrl },
			ejecutar: () => navigate({ to: "/usuarios", search: { email: u.email } }),
		}));
	}, [buscarUsuarios, usuariosQuery.data, navigate]);

	const { grupos, comandosVisibles } = useMemo(() => {
		const filtrados = filtrarComandos(comandosBase, consulta);
		const agrupados = agruparComandos([...filtrados, ...comandosUsuarios]);
		return {
			grupos: agrupados,
			comandosVisibles: agrupados.flatMap((g) => g.items),
		};
	}, [comandosBase, comandosUsuarios, consulta]);

	// Mantiene el índice activo dentro de rango si cambia la lista filtrada.
	const indiceSeguro =
		comandosVisibles.length === 0
			? -1
			: Math.min(indiceActivo, comandosVisibles.length - 1);
	const comandoActivo =
		indiceSeguro >= 0 ? comandosVisibles[indiceSeguro] : undefined;

	useEffect(() => {
		if (indiceSeguro < 0) return;
		opcionActivaRef.current?.scrollIntoView?.({ block: "nearest" });
	}, [indiceSeguro]);

	const ejecutarComando = (comando: ComandoPaleta) => {
		onCerrar();
		comando.ejecutar();
	};

	const manejarTecla = (e: KeyboardEvent<HTMLInputElement>) => {
		const total = comandosVisibles.length;
		if (e.key === "ArrowDown") {
			e.preventDefault();
			if (total > 0) setIndiceActivo((i) => (i + 1) % total);
			return;
		}
		if (e.key === "ArrowUp") {
			e.preventDefault();
			if (total > 0) setIndiceActivo((i) => (i - 1 + total) % total);
			return;
		}
		if (e.key === "Home" && !consulta && total > 0) {
			e.preventDefault();
			setIndiceActivo(0);
			return;
		}
		if (e.key === "End" && !consulta && total > 0) {
			e.preventDefault();
			setIndiceActivo(total - 1);
			return;
		}
		if (e.key === "Enter" && comandoActivo) {
			e.preventDefault();
			ejecutarComando(comandoActivo);
		}
	};

	const mostrarCargaUsuarios =
		buscarUsuarios && usuariosQuery.isFetching && comandosUsuarios.length === 0;

	let indiceGlobal = -1;

	return (
		<Dialog
			abierto={abierto}
			onCerrar={onCerrar}
			titulo="Paleta de comandos"
			ocultarCabecera
			className="max-w-xl overflow-hidden"
		>
			<div className="flex flex-col">
				<div className="flex items-center gap-3 border-b border-borde px-4 py-3">
					<Search className="size-4 shrink-0 text-tinta-tenue" />
					<input
						ref={inputRef}
						type="text"
						role="combobox"
						aria-expanded={true}
						aria-controls={listaId}
						aria-autocomplete="list"
						aria-activedescendant={
							comandoActivo ? `${id}-opcion-${comandoActivo.id}` : undefined
						}
						aria-label="Buscar comandos o usuarios por email"
						placeholder="Buscar secciones, acciones o usuarios por email…"
						value={consulta}
						onChange={(e) => {
							setConsulta(e.target.value);
							setIndiceActivo(0);
						}}
						onKeyDown={manejarTecla}
						className="w-full bg-transparent text-sm text-tinta placeholder:text-tinta-tenue focus:outline-none"
					/>
					{mostrarCargaUsuarios && (
						<Spinner
							size="sm"
							aria-label="Buscando usuarios"
							className="text-tinta-tenue"
						/>
					)}
				</div>

				<div
					id={listaId}
					role="listbox"
					aria-label="Resultados de comandos"
					className="max-h-80 overflow-y-auto p-2"
				>
					{comandosVisibles.length === 0 && !mostrarCargaUsuarios ? (
						<p className="px-3 py-8 text-center text-sm text-tinta-tenue">
							No se encontraron resultados
							{consulta.trim() ? ` para «${consulta.trim()}»` : ""}.
						</p>
					) : (
						grupos.map((grupo) => (
							<fieldset key={grupo.grupo} className="mb-2 last:mb-0">
								<legend className="px-2.5 py-1.5 text-xs font-medium text-tinta-tenue">
									{grupo.grupo}
								</legend>
								{grupo.items.map((item) => {
									indiceGlobal += 1;
									const idx = indiceGlobal;
									const esActivo = idx === indiceSeguro;
									const Icono = item.icono;
									return (
										<button
											key={item.id}
											ref={esActivo ? opcionActivaRef : undefined}
											type="button"
											id={`${id}-opcion-${item.id}`}
											role="option"
											aria-selected={esActivo}
											tabIndex={-1}
											onMouseEnter={() => setIndiceActivo(idx)}
											onClick={() => ejecutarComando(item)}
											className={cn(
												"flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
												esActivo
													? "bg-acento-suave text-acento-tinta"
													: "text-tinta hover:bg-elevada",
												item.peligro && !esActivo && "text-peligro-tinta",
											)}
										>
											{item.avatar ? (
												<Avatar
													nombre={item.avatar.nombre}
													src={item.avatar.src}
													size="sm"
												/>
											) : item.colorMuestra ? (
												<span
													aria-hidden="true"
													className="size-4 shrink-0 rounded-full border border-borde-fuerte"
													style={{ backgroundColor: item.colorMuestra }}
												/>
											) : (
												Icono && (
													<Icono
														className={cn(
															"size-4 shrink-0",
															esActivo
																? "text-acento-tinta"
																: "text-tinta-tenue",
															item.peligro && !esActivo && "text-peligro-tinta",
														)}
													/>
												)
											)}
											<span className="min-w-0 flex-1">
												<span className="block truncate font-medium">
													{item.etiqueta}
												</span>
												{item.descripcion && (
													<span className="block truncate text-xs text-tinta-tenue">
														{item.descripcion}
													</span>
												)}
											</span>
											{item.activo && (
												<Check
													aria-label="Activo"
													className="size-4 shrink-0 text-acento-tinta"
												/>
											)}
											{esActivo && !item.activo && (
												<CornerDownLeft
													aria-hidden="true"
													className="size-3.5 shrink-0 text-acento-tinta"
												/>
											)}
										</button>
									);
								})}
							</fieldset>
						))
					)}
				</div>

				<div className="flex items-center justify-between border-t border-borde bg-elevada/50 px-4 py-2 text-xs text-tinta-tenue">
					<span>↑↓ navegar · ↵ ejecutar · Esc cerrar</span>
					<span>Ctrl/⌘ K</span>
				</div>
			</div>
		</Dialog>
	);
}
