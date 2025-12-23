import type React from "react";
import { useState } from "react";
import { useDb } from "./DbContext";
import { SettingsContext } from "./SettingsContext";

interface SettingMetadata {
	name: string;
	type: "boolean" | "string";
	default: boolean | string;
	description: string;
}

type SettingValueMap = {
	boolean: boolean;
	string: string;
};

const SettingsMetadata = {
	displayName: {
		name: "Display Name",
		description: "Your name on the scoreboard.",
		type: "string",
		default: "",
	},
	classicBackground: {
		name: "Classic Background",
		description: "Enable the classic infinisweeper background style.",
		type: "boolean",
		default: false,
	},
	disableBorders: {
		name: "Disable Borders",
		description: "Disables borders around shown tiles.",
		type: "boolean",
		default: false,
	},
	disableParticles: {
		name: "Disable Particles",
		description: "Disables particle effects and falling tiles.",
		type: "boolean",
		default: false,
	},
	disableCameraShake: {
		name: "Disable Camera Shake",
		description:
			"Disable the camera shake effect when large amounts of tiles are revealed.",
		type: "boolean",
		default: false,
	},
} as const satisfies Record<string, SettingMetadata>;

export type Settings = {
	[K in keyof typeof SettingsMetadata]: SettingValueMap[(typeof SettingsMetadata)[K]["type"]];
};

export interface SettingsContextValue {
	settings: Settings;
	saveSettings: (newSettings: Settings) => void;
	SettingsMetadata: typeof SettingsMetadata;
}

const settingsKey = "settings";

interface SettingsProviderProps {
	children: React.ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
	const db = useDb();

	const [settings, setSettings] = useState<Settings>(() => {
		const existing = localStorage.getItem(settingsKey);

		const defaults = Object.fromEntries(
			Object.entries(SettingsMetadata).map(([key, meta]) => [
				key,
				meta.default,
			]),
		) as Settings;

		if (!existing) return defaults;

		try {
			const parsed = JSON.parse(existing) as Partial<Settings>;
			return { ...defaults, ...parsed };
		} catch {
			return defaults;
		}
	});

	const saveSettings = (newSettings: Settings) => {
		// Validate before saving
		if (newSettings.displayName.trim() === "") {
			throw new Error("Display name cannot be empty!");
		}

		// Save new username
		try {
			db.updateName(newSettings.displayName);
		} catch {
			throw new Error("Failed to update display name!");
		}

		// Save to localStorage
		localStorage.setItem(settingsKey, JSON.stringify(newSettings));

		// Update state
		setSettings(newSettings);
	};

	return (
		<SettingsContext.Provider
			value={{ settings, saveSettings, SettingsMetadata }}
		>
			{children}
		</SettingsContext.Provider>
	);
};
