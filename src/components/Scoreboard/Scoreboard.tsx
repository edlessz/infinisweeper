import "../../stylesheets/Menu.css";
import "./Scoreboard.css";
import { useEffect, useState } from "react";
import { useDb } from "../../contexts/DbContext";
import { Views, useView } from "../../contexts/ViewContext";
import MenuBackground from "../MenuBackground/MenuBackground";

export default function Scoreboard() {
  const { setView } = useView();
  const { supabase, name } = useDb();
  const [scoreboard, setScoreboard] = useState<Record<number, score[]> | null>(
    null,
  );

  const refreshScoreboard = () => {
    supabase
      .from("scoreboard")
      .select("name, score, game_type")
      .eq("game_type", "Normal")
      .order("score", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching scoreboard:", error.message);
          setScoreboard(null);
        } else {
          setScoreboard(
            data.reduce<Record<string, score[]>>((acc, item) => {
              const typeName = item.game_type;
              if (!acc[typeName]) acc[typeName] = [];
              acc[typeName].push(item);
              return acc;
            }, {}),
          );
        }
      });
  };
  useEffect(() => {
    refreshScoreboard();
  }, [supabase]);

  return (
    <div className="Scoreboard Menu">
      <MenuBackground />
      <h1>Scoreboard</h1>
      <div className="table">
        {scoreboard === null && <span>Loading...</span>}
        {Object.entries(scoreboard || {}).map(([gameTypeId, scores]) => (
          <div key={gameTypeId} className="scoreboard-table">
            <div className="header">{gameTypeId} Mode</div>
            <table>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={null}
                    style={{
                      fontWeight: score.name === name ? "bold" : "normal",
                    }}
                  >
                    <td>{index + 1}.</td>
                    <td>{score.name}</td>
                    <td>{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="button-container">
        <button
          type="button"
          onClick={() => {
            setView(Views.MENU);
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

interface score {
  name: string;
  score: number;
  game_type: string;
}
