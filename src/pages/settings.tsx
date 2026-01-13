import { Select } from "@radix-ui/react-select";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonList } from "@/components/ButtonList";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDb } from "@/contexts/DbContext";
import { useSettings } from "@/contexts/SettingsContext";
import { typedEntries } from "@/lib/utils";

const Settings = () => {
	const navigate = useNavigate();
	const { user, name } = useDb();
	const { settings, saveSettings, SettingsMetadata } = useSettings();
	const [tempSettings, setTempSettings] = useState({
		...settings,
		displayName: name || settings.displayName || "",
	});

	const save = () => {
		try {
			saveSettings(tempSettings);
			// Only navigate if save was successful
			navigate({ to: "/" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to save settings.");
		}
	};
	const discard = () => navigate({ to: "/" });

	return (
		<Card>
			<CardHeader>
				<CardTitle>Settings</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				{typedEntries(SettingsMetadata).map(([key, meta]) => {
					if (key === "displayName") {
						return (
							<Label
								key={key}
								className="flex flex-col items-start gap-3 rounded-lg border p-3"
							>
								<div className="grid gap-1.5">
									<p className="text-sm leading-none font-medium">
										{meta.name}
									</p>
									<p className="text-muted-foreground text-sm">
										{meta.description}
									</p>
								</div>
								<Input
									type="text"
									autoComplete="username"
									value={tempSettings[key] as string}
									onChange={(e) =>
										setTempSettings({
											...tempSettings,
											[key]: e.target.value,
										})
									}
									disabled={!user}
									placeholder={!user ? "Please sign-in!" : ""}
								/>
							</Label>
						);
					}

					switch (meta.type) {
						case "boolean":
							return (
								<Label
									key={key}
									className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-gray-600 has-aria-checked:bg-gray-50 dark:has-aria-checked:border-gray-900 dark:has-aria-checked:bg-gray-950"
								>
									<Checkbox
										checked={tempSettings[key] === true}
										onCheckedChange={(c) =>
											setTempSettings({
												...tempSettings,
												[key]: c === true,
											})
										}
									></Checkbox>
									<div className="grid gap-1.5 font-normal">
										<p className="text-sm leading-none font-medium">
											{meta.name}
										</p>
										<p className="text-muted-foreground text-sm">
											{meta.description}
										</p>
									</div>
								</Label>
							);
						case "select":
							return (
								<Label
									key={key}
									className="flex flex-col items-start gap-3 rounded-lg border p-3"
								>
									<div className="grid gap-1.5">
										<p className="text-sm leading-none font-medium">
											{meta.name}
										</p>
										<p className="text-muted-foreground text-sm">
											{meta.description}
										</p>
									</div>
									<Select
										value={tempSettings[key] as string}
										onValueChange={(value) =>
											setTempSettings({
												...tempSettings,
												[key]: value,
											})
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select an option" />
										</SelectTrigger>
										<SelectContent>
											{meta.options?.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Label>
							);
						default:
							return null;
					}
				})}
			</CardContent>
			<CardFooter className="justify-center">
				<ButtonList horizontal>
					<Button type="button" onClick={save}>
						Save
					</Button>
					<Button type="button" onClick={discard}>
						Cancel
					</Button>
				</ButtonList>
			</CardFooter>
		</Card>
	);
};

export const Route = createFileRoute("/settings")({
	component: Settings,
});
