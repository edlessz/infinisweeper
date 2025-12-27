import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AudioManager } from "@/engine/AudioManager";
import Game, { type SaveData } from "@/engine/Game";
import { ImageManager } from "@/engine/ImageManager";
import { GameContext } from "./GameContext";

interface GameProviderProps {
	children: React.ReactNode;
}

// Asset loading (moved from App.tsx)
const getSourceDictionary = (prefix: string, items: string[]) =>
	items.reduce<Record<string, string>>((acc, file) => {
		acc[file.split(".")[0]] = prefix + file;
		return acc;
	}, {});

ImageManager.loadImages(
	getSourceDictionary("images/", [
		"flag.png",
		"flag_animation.png",
		"flag_incorrect.png",
		"flag_floor.png",
		"bomb.png",
		"shovel.png",
	]),
);

AudioManager.loadAudios(
	getSourceDictionary("audio/", [
		"reveal.mp3",
		"flag_down.mp3",
		"flag_up.mp3",
		"blip_1.mp3",
		"blip_2.mp3",
		"blip_3.mp3",
		"blip_4.mp3",
		"blip_5.mp3",
		"blip_6.mp3",
		"blip_7.mp3",
		"blip_8.mp3",
		"charge.mp3",
		"confetti.mp3",
	]),
);

export const GameProvider = ({ children }: GameProviderProps) => {
	const [game, setGame] = useState<Game | null>(null);
	const [existingGame, setExistingGame] = useState<boolean>(
		() => localStorage.getItem(Game.savedGameKey) !== null,
	);
	const navigate = useNavigate();

	const newGame = useCallback(() => {
		const newGameInstance = new Game();
		setGame(newGameInstance);
		setExistingGame(true);
		navigate({ to: "/game" });
	}, [navigate]);

	const continueGame = useCallback(() => {
		const savedGame: SaveData | undefined =
			JSON.parse(localStorage.getItem(Game.savedGameKey) ?? "null") ??
			undefined;

		if (!savedGame) {
			setExistingGame(false);
			return;
		}

		const continuedGame = new Game(savedGame);
		setGame(continuedGame);
		navigate({ to: "/game" });
	}, [navigate]);

	return (
		<GameContext.Provider value={{ game, existingGame, newGame, continueGame }}>
			{children}
		</GameContext.Provider>
	);
};
