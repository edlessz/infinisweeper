import "../../stylesheets/Menu.css";
import "./Scoreboard.css";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDb } from "../../contexts/DbContext";
import { Views, useView } from "../../contexts/ViewContext";
import { db } from "../../lib/firebase";
import MenuBackground from "../MenuBackground/MenuBackground";

export default function Scoreboard() {
  const { setView } = useView();
  const { name } = useDb();
  const [scoreboard, setScoreboard] = useState<Record<string, score[]> | null>(
    null,
  );

  const refreshScoreboard = async () => {
    try {
      const scoresRef = collection(db, "scores");
      const q = query(scoresRef, orderBy("score", "desc"));
      const querySnapshot = await getDocs(q);

      const scoresByMode: Record<string, score[]> = {};

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        // Extract mode from document ID (format: UID_modename)
        const mode = docSnap.id.split("_")[1] || "classic";

        if (!scoresByMode[mode]) {
          scoresByMode[mode] = [];
        }

        scoresByMode[mode].push({
          name: data.username,
          score: data.score,
          game_type: mode,
        });
      }

      setScoreboard(scoresByMode);
    } catch (error) {
      console.error("Error fetching scoreboard:", error);
      setScoreboard(null);
    }
  };

  useEffect(() => {
    refreshScoreboard();
  }, []);

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
