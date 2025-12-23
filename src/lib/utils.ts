import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface Vector2 {
	x: number;
	y: number;
}

export const typedEntries = <T extends Record<string, unknown>>(obj: T) => {
	return Object.entries(obj) as {
		[K in keyof T]: [K, T[K]];
	}[keyof T][];
};
