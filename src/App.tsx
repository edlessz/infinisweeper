import "./App.css";
import Game from "./components/Game/Game";
import Viewport from "./components/Game/Viewport/Viewport";

const game = new Game();

function App() {
  return <Viewport Game={game} />;
}

export default App;
