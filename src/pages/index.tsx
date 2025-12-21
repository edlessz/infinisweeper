import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import Game from "@/components/Game/Game";
import { useDb } from "@/contexts/DbContext";
import { useGame } from "@/contexts/GameContext";

const Index = () => {
	const existingGame: boolean =
		localStorage.getItem(Game.savedGameKey) !== null;

	const { user, name, login, logout } = useDb();
	const { newGame, continueGame } = useGame();
	const navigate = useNavigate();

	return (
		<>
			<div className="w-full h-full flex items-center justify-center">
				<div className="w-fit flex flex-col items-center gap-4">
					<h1 className="flex">
						infinisweeper{" "}
						<img
							src="./images/flag.png"
							className="w-6 h-6 aspect-square"
							alt="infinisweeper Logo"
						/>
					</h1>
					<div className="button-container">
						<button type="button" onClick={newGame}>
							New Game
						</button>
						<button
							type="button"
							onClick={() => existingGame && continueGame()}
							disabled={!existingGame}
						>
							Continue Game
						</button>
						<button
							type="button"
							onClick={() => navigate({ to: "/scoreboard" })}
						>
							Scoreboard
						</button>
						<button type="button" onClick={() => navigate({ to: "/settings" })}>
							Settings
						</button>
					</div>
				</div>
			</div>

			<div className="absolute top-4 right-4 flex items-center gap-2">
				{user ? (
					<>
						<span>{name ? name : "Loading..."}</span>
						<button type="button" className="circle-btn" onClick={logout}>
							<LogOut />
						</button>
					</>
				) : (
					<>
						<span className="text-red-900">Signed Out</span>
						<button type="button" className="circle-btn" onClick={login}>
							<LogIn />
						</button>
					</>
				)}
			</div>
			<div className="absolute bottom-4 left-4 flex gap-2">
				<a href="https://edlessz.com" target="_blank" rel="noreferrer">
					edlessz
				</a>
				<span>•</span>
				<a
					href="https://github.com/edlessz/infinisweeper"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a>
				<span>•</span>
				<button type="button" onClick={() => navigate({ to: "/changelog" })}>
					Changelog
				</button>
			</div>
		</>
	);
};

export const Route = createFileRoute("/")({
	component: Index,
});
