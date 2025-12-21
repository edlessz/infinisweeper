import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	where,
} from "firebase/firestore";
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
import { useDb } from "@/contexts/DbContext";
import { db } from "@/lib/firebase";

interface ScoreEntry {
	name: string;
	score: number;
	game_type: string;
}

const Scoreboard = () => {
	const navigate = useNavigate();
	const { name } = useDb();
	const [scoreboard, setScoreboard] = useState<Record<
		string,
		ScoreEntry[]
	> | null>(null);

	const refreshScoreboard = useCallback(async () => {
		try {
			const modes = [
				{ id: "classic", label: "Classic" },
				{ id: "timeAttack", label: "Time Attack" }, // Future mode
			];

			const scoresByMode: Record<string, ScoreEntry[]> = {};

			await Promise.all(
				modes.map(async ({ id, label }) => {
					const q = query(
						collection(db, "scores"),
						where("mode", "==", id),
						orderBy("score", "desc"),
						limit(10),
					);
					const querySnapshot = await getDocs(q);

					scoresByMode[label] = querySnapshot.docs.map((doc) => ({
						name: doc.data().username,
						score: doc.data().score,
						game_type: label,
					}));
				}),
			);

			setScoreboard(scoresByMode);
		} catch (error) {
			console.error("Error fetching scoreboard:", error);
			setScoreboard(null);
		}
	}, []);

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
											<td>{score.score}</td>
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
