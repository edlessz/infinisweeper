import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ButtonList } from "@/components/ButtonList";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface ChangelogEntry {
	version: string;
	date: string;
	changes: string[];
}

const Changelog = () => {
	const navigate = useNavigate();
	const [changelog, setChangelog] = useState<ChangelogEntry[] | null>(null);

	const refreshChangelog = useCallback(() => {
		fetch("changelog.json")
			.then((response) => response.json())
			.then(setChangelog);
	}, []);
	useEffect(() => {
		refreshChangelog();
	}, [refreshChangelog]);

	return (
		<Card className="w-xl max-h-9/12">
			<CardHeader>
				<CardTitle>Changelog</CardTitle>
			</CardHeader>
			<CardContent className=" overflow-auto">
				<div>
					{changelog ? (
						changelog.map((entry) => (
							<details key={entry.version}>
								<summary className="flex justify-between items-center cursor-pointer selection:font-bold">
									<span>{entry.version}</span>
									<span>{entry.date}</span>
								</summary>
								<ul className="ml-8 list-disc">
									{entry.changes.map((change) => (
										<li key={change}>{change}</li>
									))}
								</ul>
							</details>
						))
					) : (
						<span>Loading...</span>
					)}
				</div>
			</CardContent>
			<CardFooter className="justify-center">
				<ButtonList>
					<Button type="button" onClick={() => navigate({ to: "/" })}>
						Back
					</Button>
				</ButtonList>
			</CardFooter>
		</Card>
	);
};

export const Route = createFileRoute("/changelog")({
	component: Changelog,
});
