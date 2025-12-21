import "../../stylesheets/Menu.css";
import "./Scoreboard.css";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
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
      const modes = [
        { id: "classic", label: "Classic" },
        // { id: "timeAttack", label: "Time Attack" }, // Future mode
      ];

      const scoresByMode: Record<string, score[]> = {};

      await Promise.all(
        modes.map(async ({ id, label }) => {
          const q = query(
            collection(db, "scores"),
            where("mode", "==", id),
            orderBy("score", "desc"),
            limit(10)
          );
          const querySnapshot = await getDocs(q);

          scoresByMode[label] = querySnapshot.docs.map((doc) => ({
            name: doc.data().username,
            score: doc.data().score,
            game_type: label,
          }));
        })
      );

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
        {Object.entries(scoreboard || {}).map(([gameType, scores]) => (
          <div key={gameType} className="scoreboard-table">
            <div className="header">{gameType} Mode</div>
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
