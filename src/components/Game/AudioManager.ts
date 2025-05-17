export default class AudioManager {
  private static audioCtx = new AudioContext();
  private static bufferCache: Record<string, AudioBuffer> = {};
  private static masterGain = AudioManager.audioCtx.createGain();
  private static activeSources: Record<string, Set<AudioBufferSourceNode>> = {};
  private static maxInstancesPerSound = 3;

  static {
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.audioCtx.destination);
  }

  public static async loadAudios(
    audios: Record<string, string>,
  ): Promise<void> {
    for (const [name, path] of Object.entries(audios)) {
      const res = await fetch(path);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      this.bufferCache[name] = audioBuffer;
      this.activeSources[name] = new Set();
    }
  }

  public static play(name: string): void {
    const buffer = this.bufferCache[name];
    if (!buffer) return console.warn(`Audio "${name}" not loaded.`);

    const active = this.activeSources[name];
    if (active.size >= this.maxInstancesPerSound) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    source.start();

    active.add(source);

    source.onended = () => active.delete(source);
  }

  public static setMaxInstances(name: string, max: number): void {
    if (!this.activeSources[name]) this.activeSources[name] = new Set();

    this.maxInstancesPerSound = max;
  }
}
