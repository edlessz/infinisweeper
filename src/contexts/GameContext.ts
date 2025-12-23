import { createContext, use } from "react";
import type Game from "@/components/Game/Game";

export interface GameContextValue {
	game: Game | null;
	existingGame: boolean;
	newGame: () => void;
	continueGame: () => void;
}

export const GameContext = createContext<GameContextValue | undefined>(
	undefined,
);

export const useGame = (): GameContextValue => {
	const context = use(GameContext);
	if (!context) throw new Error("useGame must be used within a GameProvider");
	return context;
};
