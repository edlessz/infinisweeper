import "./SweepedDialog.css";
import { CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDb } from "../../../contexts/DbContext";
import { Views, useView } from "../../../contexts/ViewContext";
import Dialog from "../../Dialog/Dialog";
import type { GameStats } from "../Game";

interface SweepedDialogProps {
  dialogVisible: boolean;
  subtext: string;
  stats: GameStats;
  newGame: (() => void) | null;
}
export default function SweepedDialog({
  dialogVisible,
  subtext,
  stats,
  newGame,
}: SweepedDialogProps) {
  const { setView } = useView();
  const { supabase, user } = useDb();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    setScoreSubmitted(false);
  }, [dialogVisible]);

  const getShareContent = (): string => {
    const points = stats.revealed
      .toString()
      .split("")
      .map(
        (n) =>
          ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][
            Number.parseInt(n)
          ],
      )
      .join("");
    return `I just scored ${points} points in Infinisweeper! Can you beat me? ${window.location.href}`;
  };
  const getFacebookShareLink = () =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href,
    )}&quote=${encodeURIComponent(getShareContent())}`;
  const getXShareLink = () =>
    `https://x.com/intent/tweet?text=${encodeURIComponent(getShareContent())}`;
  const copyShare = () => {
    const shareContent = getShareContent();
    navigator.clipboard
      .writeText(shareContent)
      .then(() => {
        alert("Copied score to clipboard!");
      })
      .catch((err) => {
        alert("Failed to copy score.");
        console.error("Failed to copy share content:", err);
      });
  };
  const submitScore = () => {
    if (!user || scoreSubmitted) return;
    setScoreSubmitted(true);
    supabase
      .from("scores")
      .insert({
        score: stats.revealed,
        game_type_id: 0,
      })
      .then(({ error }) => {
        if (error) {
          alert("Failed to submit score.");
          console.error("Error submitting score:", error);
          setScoreSubmitted(false);
        } else setScoreSubmitted(true);
      });
  };

  return (
    <Dialog visible={dialogVisible} className="SweepedDialog">
      <div>
        <h1>You've been sweeped!</h1>
        <span className="subtext">{subtext}</span>
      </div>
      <div>
        <span className="score">{stats.revealed} Points</span>
        <div className="share-buttons">
          <a
            href={getFacebookShareLink()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              height="32"
              width="32"
              src="https://cdn.simpleicons.org/facebook"
              alt="Share on Facebook"
            />
          </a>
          <a href={getXShareLink()} target="_blank" rel="noopener noreferrer">
            <img
              height="32"
              width="32"
              src="https://cdn.simpleicons.org/x"
              alt="Share on X"
            />
          </a>
          <CopyIcon width={32} height={32} onClick={copyShare} />
        </div>
      </div>
      <div className="button-container">
        <button
          type="button"
          disabled={!user || scoreSubmitted}
          onClick={submitScore}
        >
          {user
            ? scoreSubmitted
              ? "Score Submitted!"
              : "Submit Score"
            : "Login to Submit Score!"}
        </button>
        {newGame && (
          <button type="button" onClick={newGame}>
            New Game
          </button>
        )}
        <button type="button" onClick={() => setView(Views.MENU)}>
          Main Menu
        </button>
      </div>
    </Dialog>
  );
}
