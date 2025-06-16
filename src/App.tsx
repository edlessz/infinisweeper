import { useState } from "react";
import "./App.css";
import AudioManager from "./components/Game/AudioManager";
import Game, { SaveData } from "./components/Game/Game";
import ImageManager from "./components/Game/ImageManager";
import Viewport from "./components/Game/Viewport/Viewport";
import Menu from "./components/MainMenu/MainMenu";
import { useView, Views } from "./contexts/useView";
import Scoreboard from "./components/Scoreboard/Scoreboard";
import Settings from "./components/Settings/Settings";
import Changelog from "./components/Changelog/Changelog";

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

export default function App() {
  const { view, setView } = useView()!;
  const [game, setGame] = useState<Game | null>(null);

  const newGame = (): void => {
    setGame(new Game());
    setView(Views.GAME);
  };
  const continueGame = (): void => {
    const savedGame: SaveData | undefined =
      JSON.parse(localStorage.getItem(Game.savedGameKey) ?? "null") ??
      undefined;
    if (!savedGame) {
      console.error("No saved game found.");
      return;
    }
    setGame(new Game(savedGame));
    setView(Views.GAME);
  };

  switch (view) {
    default:
    case Views.MENU:
      return <Menu newGame={newGame} continueGame={continueGame} />;
    case Views.GAME:
      return game ? (
        <Viewport game={game} newGame={newGame} />
      ) : (
        <div>Could not find game.</div>
      );
    case Views.SCOREBOARD:
      return <Scoreboard />;
    case Views.SETTINGS:
      return <Settings />;
    case Views.CHANGELOG:
      return <Changelog />;
  }
}
