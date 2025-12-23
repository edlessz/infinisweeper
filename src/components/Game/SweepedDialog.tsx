import { useNavigate } from "@tanstack/react-router";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
} from "@/components/ui/dialog";
import { useDb } from "@/contexts/DbContext";
import { db } from "@/lib/firebase";
import { ButtonList } from "../ButtonList";
import type { GameStats } from "./Game";

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
	const navigate = useNavigate();
	const { user, name } = useDb();
	const [scoreSubmitted, setScoreSubmitted] = useState(false);
	const [highScore, setHighScore] = useState<number | null>(null);
	const [loadingHighScore, setLoadingHighScore] = useState(false);
	const [displayScore, setDisplayScore] = useState(0);

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

	// Animated counter effect with ease-out
	useEffect(() => {
		if (!dialogVisible) {
			setDisplayScore(0);
			return;
		}

		const duration = 1500; // 1.5 seconds
		const startTime = Date.now();

		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Ease-out cubic: starts fast, slows down at the end
			const easeOut = 1 - (1 - progress) ** 3;
			const currentScore = Math.floor(easeOut * stats.revealed);

			setDisplayScore(currentScore);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				setDisplayScore(stats.revealed);
			}
		};

		requestAnimationFrame(animate);
	}, [dialogVisible, stats.revealed]);

	const getShareContent = (): string => {
		const points = stats.revealed
			.toString()
			.split("")
			.map(
				(n) =>
					["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][
						Number.parseInt(n, 10)
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
				toast.success("Score copied to clipboard!");
			})
			.catch(() => {
				toast.error("Failed to copy score to clipboard.");
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
		} catch {
			toast.error("Failed to submit score.");
			setScoreSubmitted(false);
		}
	};

	const isNewHighScore = highScore === null || stats.revealed > highScore;
	const canSubmitScore = user && !scoreSubmitted && isNewHighScore;

	return (
		<Dialog open={dialogVisible}>
			<DialogContent className="SweepedDialog" showCloseButton={false}>
				<DialogTitle className="text-center text-xl">
					You've been sweeped!
				</DialogTitle>
				<DialogDescription className="text-center">{subtext}</DialogDescription>
				<div className="flex flex-col items-center">
					<div className="flex flex-col items-center gap-1 mb-4">
						<span className="text-6xl font-bold bg-linear-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent animate-in zoom-in duration-500">
							{displayScore.toLocaleString()}
						</span>
						<span className="text-sm text-muted-foreground">Points</span>
						{isNewHighScore && highScore !== null && (
							<span className="text-xs text-green-600 font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
								🎉 New High Score! (+
								{(stats.revealed - highScore).toLocaleString()})
							</span>
						)}
					</div>

					<div className="flex gap-2">
						<Button size="icon">
							<a
								href={getFacebookShareLink()}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Share on Facebook"
							>
								<img height="16" width="16" src="icons/facebook.svg" alt="" />
							</a>
						</Button>
						<Button size="icon">
							<a
								href={getXShareLink()}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Share on X"
							>
								<img height="16" width="16" src="icons/x.svg" alt="" />
							</a>
						</Button>
						<Button
							type="button"
							size="icon"
							onClick={copyShare}
							aria-label="Copy score to clipboard"
						>
							<CopyIcon height="16" width="16" />
						</Button>
					</div>
				</div>
				<DialogFooter>
					<ButtonList>
						<Button
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
						</Button>
						{newGame && (
							<Button type="button" onClick={newGame}>
								New Game
							</Button>
						)}
						<Button type="button" onClick={() => navigate({ to: "/" })}>
							Main Menu
						</Button>
					</ButtonList>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
