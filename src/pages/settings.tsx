import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useDb } from "@/contexts/DbContext";
import { useSettings } from "@/contexts/SettingsContext";

const Settings = () => {
	const navigate = useNavigate();
	const { updateName, user, name } = useDb();
	const { settings, saveSettings, settingsDescriptions } = useSettings();

	const [nameField, setNameField] = useState<string>(name ?? "");
	const [localSettings, setLocalSettings] = useState(settings);
	const setLocalSetting = (key: keyof typeof localSettings, value: boolean) => {
		setLocalSettings((prev) => {
			const newSettings = { ...prev, [key]: value };
			return newSettings;
		});
	};

	const save = async () => {
		try {
			await updateName(nameField);
			await saveSettings(localSettings);
			navigate({ to: "/" });
		} catch {
			alert("An unexpected error occurred. Please try again.");
		}
	};
	const discard = () => navigate({ to: "/" });
	return (
		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="menu-table grid grid-cols-2 gap-4 items-center">
					<div>
						<span>Display Name:</span>
						<div>Your username on the scoreboards.</div>
					</div>
					<input
						type="text"
						defaultValue={user ? nameField : ""}
						onChange={(e) => setNameField(e.target.value)}
						disabled={!user}
						placeholder={user ? "Enter Display Name" : "Please Sign In!"}
					/>
					<div>
						<span>Classic Background:</span>
						<div>{settingsDescriptions.classicBackground}</div>
					</div>
					<input
						type="checkbox"
						checked={localSettings.classicBackground}
						onChange={(e) =>
							setLocalSetting("classicBackground", e.target.checked)
						}
					/>
					<div>
						<span>Disable Borders:</span>
						<div>{settingsDescriptions.disableBorders}</div>
					</div>
					<input
						type="checkbox"
						checked={localSettings.disableBorders}
						onChange={(e) =>
							setLocalSetting("disableBorders", e.target.checked)
						}
					/>
					<div>
						<span>Disable Camera Shake:</span>
						<div>{settingsDescriptions.disableCameraShake}</div>
					</div>
					<input
						type="checkbox"
						checked={localSettings.disableCameraShake}
						onChange={(e) =>
							setLocalSetting("disableCameraShake", e.target.checked)
						}
					/>
					<div>
						<span>Disable Particles:</span>
						<div>{settingsDescriptions.disableParticles}</div>
					</div>
					<input
						type="checkbox"
						checked={localSettings.disableParticles}
						onChange={(e) =>
							setLocalSetting("disableParticles", e.target.checked)
						}
					/>
				</div>
			</CardContent>
			<CardFooter>
				<button type="button" onClick={save}>
					Save & Return
				</button>
				<button type="button" onClick={discard}>
					Discard & Return
				</button>
			</CardFooter>
		</Card>
	);
};

export const Route = createFileRoute("/settings")({
	component: Settings,
});
