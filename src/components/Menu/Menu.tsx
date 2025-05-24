import { useState } from "react";
import Dialog from "../Dialog/Dialog";
import "./Menu.css";
import MenuBackground from "./MenuBackground/MenuBackground";

interface MenuProps {
  newGame: () => void;
  continueGame: () => void;
}

export default function Menu({ newGame, continueGame }: MenuProps) {
  const existingGame: boolean = localStorage.getItem("savedGame") !== null;

  const [visible, setVisible] = useState(false);

  return (
    <div className="Menu">
      <h1>
        Infinisweeper <img src="./images/flag.png"></img>
      </h1>
      <div className="buttonContainer">
        <button onClick={newGame}>New Game</button>
        <button
          onClick={() => existingGame && continueGame()}
          disabled={!existingGame}
        >
          Continue Game
        </button>
        <button onClick={() => setVisible(!visible)}>Show</button>
      </div>
      <MenuBackground />
      <Dialog title="hi" visible={visible}>
        <div>this is a test</div>
      </Dialog>
    </div>
  );
}
