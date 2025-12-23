import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";
import { ButtonList } from "@/components/ButtonList";
import Game from "@/components/Game/Game";
import { Button } from "@/components/ui/button";
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
				<div className="w-fit flex flex-col items-center gap-8">
					<div className="flex font-bold items-center gap-4">
						<h1 className="text-4xl">infinisweeper</h1>
					</div>
					<ButtonList>
						<Button type="button" onClick={newGame}>
							New Game
						</Button>
						<Button
							type="button"
							onClick={() => existingGame && continueGame()}
							disabled={!existingGame}
						>
							Continue Game
						</Button>
						<Button
							type="button"
							onClick={() => navigate({ to: "/scoreboard" })}
						>
							Scoreboard
						</Button>
						<Button type="button" onClick={() => navigate({ to: "/settings" })}>
							Settings
						</Button>
					</ButtonList>
				</div>
			</div>

			<div className="absolute top-4 right-4 flex items-center gap-2">
				{user ? (
					<>
						<span>{name ? name : "Loading..."}</span>
						<Button
							type="button"
							size="icon"
							onClick={async () => {
								try {
									await logout();
								} catch {
									toast.error("Failed to log out!");
								}
							}}
						>
							<LogOut />
						</Button>
					</>
				) : (
					<>
						<span className="text-red-900">Signed Out</span>
						<Button
							type="button"
							size="icon"
							onClick={async () => {
								try {
									await login();
								} catch {
									toast.error("Failed to log in!");
								}
							}}
						>
							<LogIn />
						</Button>
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
				<Link to="/changelog">Changelog</Link>
			</div>
		</>
	);
};

export const Route = createFileRoute("/")({
	component: Index,
});
