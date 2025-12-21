import seedrandom from "seedrandom";
import { AudioManager } from "./AudioManager";
import type Game from "./Game";
import type { GameStats, SaveData } from "./Game";
import { ImageManager } from "./ImageManager";
import Particle from "./Particle";
import ParticleManager from "./ParticleManager";
import type Vector2 from "./Vector2";

type Key = [number, number];
interface Tile {
	value: number; // -1 for mine
	state: TileState;
	interactedAt: number;
	exploded: boolean; // for bomb explosion effect
}

enum TileState {
	REVEALED = 0,
	UNREVEALED = 1,
	FLAGGED = 2,
	FLAGGED_INCORRECT = 3,
}

type BoardSaveData = Pick<SaveData, "seed" | "board">;
enum EventQueueType {
	REVEAL = 0,
	INCORRECT_FLAG = 1,
}

const TEXT_COLORS: Record<number, string> = {
	1: "#1977D3",
	2: "#3B8E3F",
	3: "#D53734",
	4: "#7A1EA2",
	5: "#FF8F00",
	6: "#159AA4",
	7: "#434343",
	8: "#A99D93",
};

export default class Board {
	private tilesRevealed = 0;
	private tilesFlagged = 0;
	private game: Game;

	private board: Map<string, Tile> = new Map();
	private particleManager = new ParticleManager();

	private static getAddress(position: Key): string {
		return `${position[0]},${position[1]}`;
	}
	public static getKey(address: string): Key {
		const [x, y] = address.split(",").map(Number);
		return [x, y];
	}

	private bombChance = 0.18;
	private borderThickness = 0.1;
	private seed: number;

	constructor(
		game: Game,
		bombChance?: number,
		seed?: number,
		savedBoard?: string[],
	) {
		this.bombChance = bombChance ?? this.bombChance;
		this.seed = seed ?? Date.now();
		this.game = game;

		if (savedBoard) {
			for (const address of savedBoard) {
				const [x, y] = Board.getKey(address.replace(".", ","));
				let state = TileState.UNREVEALED;
				if (address.includes(",")) {
					state = TileState.REVEALED;
					this.tilesRevealed++;
				}
				if (address.includes(".")) {
					state = TileState.FLAGGED;
					this.tilesFlagged++;
				}
				this.updateTile([x, y], {
					state,
					interactedAt: -1000,
				});
			}

			this.updateStats();
		}
	}

	protected generate(position: Key): Tile {
		const existingTile = this.board.get(Board.getAddress(position));
		if (existingTile) return existingTile;

		const cellSeed = `${this.seed}-${position[0]}-${position[1]}`;
		const rng = seedrandom(cellSeed)();

		const tile: Tile = {
			value: rng < this.bombChance ? -1 : 0,
			state: TileState.UNREVEALED,
			interactedAt: -1000,
			exploded: false,
		};
		this.board.set(Board.getAddress(position), tile);

		const [x, y] = position;
		for (let xx = x - 1; xx <= x + 1; xx++) {
			for (let yy = y - 1; yy <= y + 1; yy++) {
				if (xx === x && yy === y) continue; // skip the current tile
				const address = Board.getAddress([xx, yy]);
				const neighbor = this.board.get(address);

				// if tile is bomb, update the surrounding tiles
				// if tile is empty, count surrounding bombs
				if (tile.value === -1) {
					if (!neighbor || neighbor.value === -1) continue;
					this.updateTile([xx, yy], {
						value: neighbor.value + 1,
					});
				} else if (neighbor?.value === -1) tile.value++;
			}
		}

		return tile;
	}

	private getTile(position: Key): Tile {
		const tile = this.board.get(Board.getAddress(position));
		if (!tile) return this.generate(position);
		return tile;
	}

	private updateTile(position: Key, tile: Partial<Tile>): void {
		const existingTile = this.getTile(position);
		this.board.set(Board.getAddress(position), { ...existingTile, ...tile });
	}

	private getTileColor(position: Key, tile: Tile): string {
		const [x, y] = position;

		if (tile.state >= TileState.UNREVEALED)
			return (x + y) % 2 === 0 ? "#AAD650" : "#A2D048";
		return (x + y) % 2 === 0 ? "#E4C29E" : "#D7B998";
	}

	public update(): void {
		this.processRevealQueue();

		if (this.game.hooks?.getSettings().disableParticles)
			this.particleManager.clear();
		else this.particleManager.update();
	}

	public render(
		ctx: CanvasRenderingContext2D,
		[boundTopLeft, boundBottomRight]: [Vector2, Vector2],
	): number {
		ctx.font = "bold 0.75px 'Roboto'";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";

		for (let x = Math.floor(boundTopLeft.x); x < boundBottomRight.x; x++) {
			for (let y = Math.floor(boundTopLeft.y); y < boundBottomRight.y; y++) {
				const tile = this.getTile([x, y]);
				ctx.fillStyle = this.getTileColor([x, y], tile);
				ctx.fillRect(x, y, 1, 1);

				switch (tile.state) {
					case TileState.REVEALED: {
						if (tile.value > 0) {
							ctx.fillStyle = TEXT_COLORS[tile.value] ?? "#000";
							ctx.fillText(tile.value.toString(), x + 0.5, y + 0.5 + 0.05);
						}
						if (tile.value === -1) {
							const image = ImageManager.get("bomb");
							const revealTime = tile.interactedAt;
							const elapsed = (performance.now() - revealTime) / 1000;
							const fade = Math.min(elapsed / 0.75, 1);

							if (image) {
								ctx.drawImage(image, x, y, 1, 1);
								if (fade > 0 && fade < 1) {
									ctx.save();
									ctx.globalAlpha = fade;
									ctx.fillStyle = "#fff";
									ctx.fillRect(x, y, 1, 1);
									ctx.restore();
								}
							}

							if (fade === 1) {
								if (!tile.exploded) {
									this.particleManager.explode(x, y);
									AudioManager.play("confetti");
								}
								this.updateTile([x, y], { exploded: true });
							}
						}

						// draw borders
						if (this.game.hooks?.getSettings().disableBorders) break;
						ctx.fillStyle = "#86AE3A";

						const revealedNeighbors = {
							left: this.getTile([x - 1, y]).state === TileState.REVEALED,
							right: this.getTile([x + 1, y]).state === TileState.REVEALED,
							top: this.getTile([x, y - 1]).state === TileState.REVEALED,
							bottom: this.getTile([x, y + 1]).state === TileState.REVEALED,
							topLeft:
								this.getTile([x - 1, y - 1]).state === TileState.REVEALED,
							topRight:
								this.getTile([x + 1, y - 1]).state === TileState.REVEALED,
							bottomLeft:
								this.getTile([x - 1, y + 1]).state === TileState.REVEALED,
							bottomRight:
								this.getTile([x + 1, y + 1]).state === TileState.REVEALED,
						};

						if (!revealedNeighbors.left)
							ctx.fillRect(x, y, this.borderThickness, 1);
						if (!revealedNeighbors.right)
							ctx.fillRect(
								x + 1 - this.borderThickness,
								y,
								this.borderThickness,
								1,
							);
						if (!revealedNeighbors.top)
							ctx.fillRect(x, y, 1, this.borderThickness);
						if (!revealedNeighbors.bottom)
							ctx.fillRect(
								x,
								y + 1 - this.borderThickness,
								1,
								this.borderThickness,
							);

						if (!revealedNeighbors.topLeft)
							ctx.fillRect(x, y, this.borderThickness, this.borderThickness);
						if (!revealedNeighbors.topRight)
							ctx.fillRect(
								x + 1 - this.borderThickness,
								y,
								this.borderThickness,
								this.borderThickness,
							);
						if (!revealedNeighbors.bottomLeft)
							ctx.fillRect(
								x,
								y + 1 - this.borderThickness,
								this.borderThickness,
								this.borderThickness,
							);
						if (!revealedNeighbors.bottomRight)
							ctx.fillRect(
								x + 1 - this.borderThickness,
								y + 1 - this.borderThickness,
								this.borderThickness,
								this.borderThickness,
							);

						break;
					}
					case TileState.FLAGGED: {
						const frame = Math.min(
							Math.floor((performance.now() - tile.interactedAt) / 20),
							9,
						);
						const image = ImageManager.get("flag_animation");
						if (image) ctx.drawImage(image, 0, 81 * frame, 81, 81, x, y, 1, 1);
						break;
					}
					case TileState.FLAGGED_INCORRECT: {
						const image = ImageManager.get("flag_incorrect");
						if (image) ctx.drawImage(image, x, y, 1, 1);
						break;
					}
				}
			}
		}

		this.particleManager.render(ctx);

		const xCount = Math.floor(boundBottomRight.x) - Math.floor(boundTopLeft.x);
		const yCount = Math.floor(boundBottomRight.y) - Math.floor(boundTopLeft.y);
		return xCount * yCount;
	}

	public attemptReveal(position: Key): void {
		const tile = this.getTile(position);
		if (tile.state >= TileState.FLAGGED) return;

		// Generate surrounding tiles
		for (let x = position[0] - 2; x <= position[0] + 2; x++) {
			for (let y = position[1] - 2; y <= position[1] + 2; y++) {
				if (x === position[0] && y === position[1]) continue; // skip the current tile
				this.generate([x, y]);
			}
		}

		// Surrounding tiles shortcut
		if (tile.state === TileState.REVEALED) {
			// count surrounding flags
			let flaggedCount = 0;
			for (let x = position[0] - 1; x <= position[0] + 1; x++) {
				for (let y = position[1] - 1; y <= position[1] + 1; y++) {
					if (x === position[0] && y === position[1]) continue;
					const neighbor = this.getTile([x, y]);
					if (neighbor.state >= TileState.FLAGGED) flaggedCount++;
				}
			}
			if (flaggedCount === tile.value) {
				// reveal surrounding tiles
				for (let x = position[0] - 1; x <= position[0] + 1; x++) {
					for (let y = position[1] - 1; y <= position[1] + 1; y++) {
						if (x === position[0] && y === position[1]) continue;
						const neighbor = this.getTile([x, y]);
						if (neighbor.state === TileState.UNREVEALED)
							this.attemptReveal([x, y]);
					}
				}
			}
			this.updateStats();
			return;
		}

		// Reveal the tile, effects
		this.particleManager.add(
			new Particle(
				{ x: position[0], y: position[1] },
				this.getTileColor(position, tile),
			),
		);
		this.updateTile(position, {
			state: TileState.REVEALED,
			interactedAt: performance.now(),
		});
		this.tilesRevealed++;
		const soundNum = Math.max(tile.value, 1);
		if (tile.value >= 0) AudioManager.play(`blip_${soundNum}`);
		if (tile.value === -1) {
			AudioManager.play("charge");
			this.game.loseGame();
		}

		// Reveal surrounding tiles if revealed tile is 0
		if (tile.value === 0)
			for (let x = position[0] - 1; x <= position[0] + 1; x++) {
				for (let y = position[1] - 1; y <= position[1] + 1; y++) {
					if (x === position[0] && y === position[1]) continue;
					if (
						this.eventQueue.some(
							(item) => item.position[0] === x && item.position[1] === y,
						)
					)
						continue;
					this.eventQueue.push({
						position: [x, y],
						time: performance.now() + 100,
						type: EventQueueType.REVEAL,
					});
				}
			}

		this.updateStats();
	}

	public toggleFlag(position: Key): void {
		const tile = this.getTile(position);
		if (tile.state === TileState.REVEALED) return;

		this.updateTile(position, {
			state:
				tile.state === TileState.FLAGGED
					? TileState.UNREVEALED
					: TileState.FLAGGED,
			interactedAt: performance.now(),
		});
		this.tilesFlagged += tile.state === TileState.FLAGGED ? -1 : 1;
		AudioManager.play(
			tile.state === TileState.FLAGGED ? "flag_up" : "flag_down",
		);
		if (tile.state === TileState.FLAGGED)
			this.particleManager.popFlag({ x: position[0], y: position[1] });

		this.updateStats();
	}

	public getFirstZero(remainder: number): Key | null {
		for (const [address, tile] of this.board.entries()) {
			const [x, y] = Board.getKey(address);
			if (tile.value === 0 && (x + y) % 2 === remainder && x > 0 && y > 0)
				return [x, y];
		}
		return null;
	}

	private eventQueue: {
		position: Key;
		type: EventQueueType;
		time: number;
	}[] = [];
	private processRevealQueue(): void {
		const now = performance.now();

		for (const event of this.eventQueue) {
			if (event.time <= now)
				switch (event.type) {
					case EventQueueType.REVEAL:
						this.attemptReveal(event.position);
						break;
					case EventQueueType.INCORRECT_FLAG:
						this.updateTile(event.position, {
							state: TileState.FLAGGED_INCORRECT,
						});
						this.particleManager.popFlag({
							x: event.position[0],
							y: event.position[1],
						});
						AudioManager.play("flag_up");
						break;
				}
		}

		this.eventQueue = this.eventQueue.filter((tile) => tile.time > now);
	}

	public getSaveData(): BoardSaveData {
		return {
			board: Array.from(this.board.entries()).reduce<string[]>(
				(acc, [address, tile]) => {
					if (tile.state === TileState.REVEALED) acc.push(address);
					else if (tile.state >= TileState.FLAGGED)
						acc.push(address.replace(",", "."));
					return acc;
				},
				[],
			),
			seed: this.seed,
		};
	}

	public showIncorrectFlags(): void {
		let foundInccorectFlags = 0;
		const startTimeMillis = 1500; // time after game loss
		this.board.forEach((tile, address) => {
			if (tile.state === TileState.FLAGGED && tile.value !== -1) {
				this.eventQueue.push({
					position: Board.getKey(address),
					type: EventQueueType.INCORRECT_FLAG,
					time: performance.now() + startTimeMillis + foundInccorectFlags * 250,
				});
				foundInccorectFlags++;
			}
		});
	}

	public getRevealQueueLength(): number {
		return this.eventQueue.filter((x) => x.type === EventQueueType.REVEAL)
			.length;
	}

	public updateStats(): GameStats {
		const stats: GameStats = {
			flags: this.tilesFlagged,
			revealed: this.tilesRevealed,
		};
		this.game.hooks?.setStats(stats);
		return stats;
	}
}
