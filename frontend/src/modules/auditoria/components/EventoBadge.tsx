import { Badge, type BadgeProps } from "@/core/components/ui/Badge";

/** El verbo del evento (`usuario.eliminado`) decide el color. */
function variante(evento: string): BadgeProps["variant"] {
	if (/elimin|borr|revoc/.test(evento)) return "danger";
	if (/cread|registr/.test(evento)) return "success";
	if (/actualiz|cambi/.test(evento)) return "accent";
	return "default";
}

export function EventoBadge({ evento }: { evento: string }) {
	return (
		<Badge variant={variante(evento)} className="font-mono">
			{evento}
		</Badge>
	);
}
