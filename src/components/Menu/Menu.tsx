import Game from "../Game/Game";
import "./Menu.css";
import MenuBackground from "./MenuBackground/MenuBackground";
import { useDb } from "../../contexts/useDb";
import { LogIn, LogOut } from "lucide-react";

interface MenuProps {
  newGame: () => void;
  continueGame: () => void;
}

export default function Menu({ newGame, continueGame }: MenuProps) {
  const existingGame: boolean =
    localStorage.getItem(Game.savedGameKey) !== null;

  const { user, name, login, logout } = useDb()!;

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
      <div className="account">
        {user ? (
          <>
            <span>{name ? name : "Loading..."}</span>
            <button className="circle-btn" onClick={logout}>
              <LogOut />
            </button>
          </>
        ) : (
          <>
            <span className="signed-out-label">Signed Out</span>
            <button className="circle-btn" onClick={login}>
              <LogIn />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
