import type React from "react";
import { useState } from "react";
import { useDb } from "./DbContext";
import { SettingsContext } from "./SettingsContext";

interface SettingMetadata<T = unknown> {
	name: string;
	type: "boolean" | "string" | "select";
	default: T;
	description: string;
	options?: { value: T; label: string }[];
}

type InferSettingValue<T> = T extends SettingMetadata<infer V> ? V : never;

const SettingsMetadata = {
	displayName: {
		name: "Display Name",
		description: "Your name on the scoreboard.",
		type: "string" as const,
		default: "",
	},
	classicBackground: {
		name: "Classic Background",
		description: "Enable the classic infinisweeper background style.",
		type: "boolean" as const,
		default: false,
	},
	disableBorders: {
		name: "Disable Borders",
		description: "Disables borders around shown tiles.",
		type: "boolean" as const,
		default: false,
	},
	disableParticles: {
		name: "Disable Particles",
		description: "Disables particle effects and falling tiles.",
		type: "boolean" as const,
		default: false,
	},
	disableCameraShake: {
		name: "Disable Camera Shake",
		description:
			"Disable the camera shake effect when large amounts of tiles are revealed.",
		type: "boolean" as const,
		default: false,
	},
	autosaveInterval: {
		name: "Autosave Interval",
		description: "Automatically save game progress at regular intervals.",
		type: "select" as const,
		default: "60",
		options: [
			{ value: "0", label: "Disabled" },
			{ value: "30", label: "Every 30 seconds" },
			{ value: "60", label: "Every 1 minute" },
			{ value: "120", label: "Every 2 minutes" },
			{ value: "300", label: "Every 5 minutes" },
		],
	},
} satisfies Record<string, SettingMetadata>;

export type Settings = {
	[K in keyof typeof SettingsMetadata]: InferSettingValue<
		(typeof SettingsMetadata)[K]
	>;
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
	const { user, updateName } = useDb();

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
		if (user) {
			// Validate before saving
			if (newSettings.displayName.trim() === "") {
				throw new Error("Display name cannot be empty!");
			}

			// Save new username
			try {
				updateName(newSettings.displayName);
			} catch {
				throw new Error("Failed to update display name!");
			}
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
