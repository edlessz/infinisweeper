import "./App.css";
import AudioManager from "./components/Game/AudioManager";
import Game, { SavedGame } from "./components/Game/Game";
import ImageManager from "./components/Game/ImageManager";
import Viewport from "./components/Game/Viewport/Viewport";
import Menu from "./components/Menu/Menu";
import { useView, Views } from "./contexts/useView";

ImageManager.loadImages({
  flag_animation: "flag_animation.png",
  flag: "flag.png",
});
AudioManager.loadAudios({
  reveal: "reveal.mp3",
  flag_down: "flag_down.mp3",
  flag_up: "flag_up.mp3",
  blip_1: "blip_1.mp3",
  blip_2: "blip_2.mp3",
  blip_3: "blip_3.mp3",
  blip_4: "blip_4.mp3",
  blip_5: "blip_5.mp3",
  blip_6: "blip_6.mp3",
  blip_7: "blip_7.mp3",
  blip_8: "blip_8.mp3",
});

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
