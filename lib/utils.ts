import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function is_standard_champion(id: number) {
	const n = Number(id);
	return Number.isFinite(n) && n > 0 && n < 3000;
}

export function is_classic_champion(id: number) {
	const n = Number(id);
	return Number.isFinite(n) && n >= 60000 && n < 66000;
}

export function is_mastery_champion(id: number) {
	const n = Number(id);
	return is_standard_champion(n) || is_classic_champion(n);
}

export function format_champion_name(name: string, id: number) {
	return is_classic_champion(id) ? `${name} (Classic)` : name;
}
