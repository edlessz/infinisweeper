import "./Menu.css";

interface MenuProps {
  newGame: () => void;
  continueGame: () => void;
}

export default function Menu({ newGame, continueGame }: MenuProps) {
  const existingGame: boolean = localStorage.getItem("savedGame") !== null;

  return (
    <div className="Menu">
      <h1>
        Infinisweeper <img src="./flag.png"></img>
      </h1>
      <div className="buttonContainer">
        <button onClick={newGame}>New Game</button>
        <button
          onClick={() => existingGame && continueGame()}
          disabled={!existingGame}
        >
          Continue Game
        </button>
      </div>
    </div>
  );
}
