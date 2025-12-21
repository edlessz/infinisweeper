import { createFileRoute } from "@tanstack/react-router";
import Viewport from "@/components/Game/Viewport";
import { useGame } from "@/contexts/GameContext";

const Game = () => {
	const { game, newGame } = useGame();

	if (!game) {
		return (
			<div className="flex items-center justify-center h-full">
				<span>Could not find game.</span>
			</div>
		);
	}

	return <Viewport game={game} newGame={newGame} />;
};

export const Route = createFileRoute("/game")({
	component: Game,
});
