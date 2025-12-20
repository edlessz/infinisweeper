import "./SweepedDialog.css";
import { Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDb } from "../../../contexts/DbContext";
import { Views, useView } from "../../../contexts/ViewContext";
import { db } from "../../../lib/firebase";
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
  const { user, name } = useDb();
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [loadingHighScore, setLoadingHighScore] = useState(false);

  useEffect(() => {
    setScoreSubmitted(false);
    setHighScore(null);

    // Fetch the user's high score when dialog opens
    const fetchHighScore = async () => {
      if (!user || !dialogVisible) return;

      setLoadingHighScore(true);
      try {
        const scoreDocId = `${user.uid}_classic`;
        const scoreDocRef = doc(db, "scores", scoreDocId);
        const scoreDoc = await getDoc(scoreDocRef);

        if (scoreDoc.exists()) {
          setHighScore(scoreDoc.data().score);
        }
      } catch (error) {
        console.error("Error fetching high score:", error);
      } finally {
        setLoadingHighScore(false);
      }
    };

    fetchHighScore();
  }, [dialogVisible, user]);

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
  const submitScore = async () => {
    if (!user || !name || scoreSubmitted) return;
    setScoreSubmitted(true);

    try {
      const scoreDocId = `${user.uid}_classic`;
      const scoreDocRef = doc(db, "scores", scoreDocId);

      // Submit the new high score
      await setDoc(scoreDocRef, {
        score: stats.revealed,
        username: name,
        updatedAt: Timestamp.now(),
      });

      setScoreSubmitted(true);
    } catch (error) {
      alert("Failed to submit score.");
      console.error("Error submitting score:", error);
      setScoreSubmitted(false);
    }
  };

  const isNewHighScore = highScore === null || stats.revealed > highScore;
  const canSubmitScore = user && !scoreSubmitted && isNewHighScore;

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
          disabled={!canSubmitScore || loadingHighScore}
          onClick={submitScore}
        >
          {!user
            ? "Login to Submit Score!"
            : loadingHighScore
              ? "Loading..."
              : scoreSubmitted
                ? "Score Submitted!"
                : !isNewHighScore
                  ? `High Score: ${highScore ?? 0}`
                  : "Submit Score"}
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
