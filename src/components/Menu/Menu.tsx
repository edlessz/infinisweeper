import Game from "../Game/Game";
import "./Menu.css";
import MenuBackground from "./MenuBackground/MenuBackground";

interface MenuProps {
  newGame: () => void;
  continueGame: () => void;
}

export default function Menu({ newGame, continueGame }: MenuProps) {
  const existingGame: boolean =
    localStorage.getItem(Game.savedGameKey) !== null;

  return (
    <div className="Menu">
      <h1>
        Infinisweeper <img src="./images/flag.png"></img>
      </h1>
      <div className="button-container">
        <button onClick={newGame}>New Game</button>
        <button
          onClick={() => existingGame && continueGame()}
          disabled={!existingGame}
        >
          Continue Game
        </button>
      </div>
      <MenuBackground />
    </div>
  );
}
