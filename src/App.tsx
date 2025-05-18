import "./App.css";
import AudioManager from "./components/Game/AudioManager";
import Game, { SavedGame } from "./components/Game/Game";
import ImageManager from "./components/Game/ImageManager";
import Viewport from "./components/Game/Viewport/Viewport";
import Menu from "./components/Menu/Menu";
import { useView, Views } from "./contexts/useView";

const getSourceDictionary = (
  prefix: string,
  items: string[]
): Record<string, string> =>
  items.reduce(
    (acc, file) => {
      acc[file.split(".")[0]] = prefix + file;
      return acc;
    },
    {} as Record<string, string>
  );
ImageManager.loadImages(
  getSourceDictionary("images/", ["flag.png", "flag_animation.png"])
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
  ])
);

let game: Game | null = null;

export default function App() {
  const { view, setView } = useView();

  const newGame = (): void => {
    game = new Game();
    setView(Views.GAME);
  };
  const continueGame = (): void => {
    const savedGame: SavedGame | undefined =
      JSON.parse(localStorage.getItem("savedGame") || "null") ?? undefined;
    if (!savedGame) return console.error("No saved game found.");
    game = new Game(savedGame);
    setView(Views.GAME);
  };

  switch (view) {
    default:
    case Views.MENU:
      return <Menu newGame={newGame} continueGame={continueGame} />;
    case Views.GAME:
      return game ? <Viewport Game={game} /> : <div>Could not find game.</div>;
  }
}
