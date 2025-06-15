import "../../stylesheets/Menu.css";
import "./MainMenu.css";
import Game from "../Game/Game";
import MenuBackground from "../MenuBackground/MenuBackground";
import { useDb } from "../../contexts/useDb";
import { LogIn, LogOut } from "lucide-react";
import { useView, Views } from "../../contexts/useView";

interface MainMenuProps {
  newGame: () => void;
  continueGame: () => void;
}

export default function MainMenu({ newGame, continueGame }: MainMenuProps) {
  const existingGame: boolean =
    localStorage.getItem(Game.savedGameKey) !== null;

  const { user, name, login, logout } = useDb()!;
  const { setView } = useView()!;

  return (
    <div className="MainMenu Menu">
      <MenuBackground />
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
        <button onClick={() => setView(Views.SCOREBOARD)}>Scoreboard</button>
        <button onClick={() => setView(Views.SETTINGS)}>Settings</button>
      </div>
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
      <div className="links">
        <a href="https://edlessz.com" target="_blank">
          edlessz
        </a>
        <span>•</span>
        <a href="https://github.com/edlessz/infinisweeper" target="_blank">
          GitHub
        </a>
      </div>
    </div>
  );
}
