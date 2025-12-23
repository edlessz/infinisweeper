const audioCtx = new AudioContext();
const masterGain = audioCtx.createGain();
masterGain.gain.value = 1.0;
masterGain.connect(audioCtx.destination);

const bufferCache: Record<string, AudioBuffer> = {};
const activeSources: Record<string, Set<AudioBufferSourceNode>> = {};
let maxInstancesPerSound = 3;

export const AudioManager = {
	async loadAudios(audios: Record<string, string>): Promise<void> {
		for (const [name, path] of Object.entries(audios)) {
			const res = await fetch(path);
			const arrayBuffer = await res.arrayBuffer();
			const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
			bufferCache[name] = audioBuffer;
			activeSources[name] = new Set();
		}
	},

	play(name: string, playbackRate = 1.0): void {
		const buffer = bufferCache[name];
		if (!buffer) {
			console.warn(`Audio "${name}" not loaded.`);
			return;
		}

		const active = activeSources[name];
		if (active.size >= maxInstancesPerSound) return;

		const source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.playbackRate.value = playbackRate;
		source.connect(masterGain);
		source.start();

		active.add(source);
		source.onended = () => active.delete(source);
	},

	setMaxInstances(name: string, max: number): void {
		if (!activeSources[name]) activeSources[name] = new Set();
		maxInstancesPerSound = max;
	},

	setVolume(volume: number): void {
		masterGain.gain.value = volume;
	},
};
