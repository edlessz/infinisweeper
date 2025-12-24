import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
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
import { useDb } from "@/contexts/DbContext";
import type { ScoreEntry } from "@/contexts/DbProvider";

const Scoreboard = () => {
	const navigate = useNavigate();
	const { name, getScoreboard } = useDb();
	const [scoreboard, setScoreboard] = useState<Record<
		string,
		ScoreEntry[]
	> | null>(null);

	const refreshScoreboard = useCallback(async () => {
		try {
			const scoresByMode = await getScoreboard();
			setScoreboard(scoresByMode);
		} catch {
			toast.error("There was an error loading the scoreboard!");
			setScoreboard(null);
		}
	}, [getScoreboard]);

	useEffect(() => {
		refreshScoreboard();
	}, [refreshScoreboard]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Scoreboard</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex gap-4">
					{scoreboard === null && <span>Loading...</span>}
					{Object.entries(scoreboard || {}).map(([gameType, scores]) => (
						<div key={gameType} className="scoreboard-table">
							<div className="font-bold text-center">{gameType} Mode</div>
							<table>
								<tbody>
									{scores.map((score, index) => (
										<tr
											key={score.name}
											style={{
												fontWeight: score.name === name ? "bold" : "normal",
											}}
										>
											<td className="pr-2 text-right">{index + 1}.</td>
											<td className="pr-4">{score.name}</td>
											<td className="text-right">{score.score}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					))}
				</div>
			</CardContent>
			<CardFooter className="justify-center">
				<ButtonList horizontal>
					<Button type="button" onClick={() => navigate({ to: "/" })}>
						Back
					</Button>
				</ButtonList>
			</CardFooter>
		</Card>
	);
};

export const Route = createFileRoute("/scoreboard")({
	component: Scoreboard,
});
