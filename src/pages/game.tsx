import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Viewport } from "@/components/game/Viewport";
import { useGame } from "@/contexts/GameContext";

const Game = () => {
	const { game, newGame, existingGame, continueGame } = useGame();

	useEffect(() => {
		if (!game) {
			if (existingGame) continueGame();
			else newGame();
		}
	}, [game, newGame, existingGame, continueGame]);

	if (!game) {
		return (
			<div className="flex items-center justify-center h-full">
				<span>Loading...</span>
			</div>
		);
	}

	return <Viewport game={game} newGame={newGame} />;
};

export const Route = createFileRoute("/game")({
	component: Game,
});
