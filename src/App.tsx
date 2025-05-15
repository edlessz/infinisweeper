import "./App.css";
import AudioManager from "./components/Game/AudioManager";
import Game from "./components/Game/Game";
import ImageManager from "./components/Game/ImageManager";
import Viewport from "./components/Game/Viewport/Viewport";

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

const game = new Game();

function App() {
  return <Viewport Game={game} />;
}

export default App;
