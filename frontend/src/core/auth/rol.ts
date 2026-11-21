import type { BadgeProps } from "@/core/components/ui/Badge";

/** Color de la insignia de roles: acento para ADMIN, aviso para MOD. */
export function varianteRol(roles: string[]): BadgeProps["variant"] {
	if (roles.includes("ADMIN")) return "accent";
	if (roles.includes("MOD")) return "warning";
	return "default";
}
