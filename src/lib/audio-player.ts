import { Audio } from 'expo-av';

export type AudioTrack = {
  songId: number;
  audioUrl: string;
};

export type PlayerState = {
  songId: number | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
};

type Listener = (state: PlayerState) => void;

class AudioPlayerService {
  private sound: any = null;
  private activeSongId: number | null = null;
  private listeners = new Set<Listener>();
  private initialized = false;
  private state: PlayerState = {
    songId: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
  };
  private loading: Promise<void> | null = null;

  private emit() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getState());

    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): PlayerState {
    return { ...this.state };
  }

  private setState(patch: Partial<PlayerState>) {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  async stopCurrent() {
    if (!this.sound) return;

    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
    } catch (error) {
      console.warn('Stop current sound failed:', error);
    } finally {
      this.sound = null;
      this.activeSongId = null;
      this.setState({ songId: null, isPlaying: false, positionMs: 0, durationMs: 0 });
    }
  }

  async playTrack(track: AudioTrack) {
    await this.ensureAudioMode();
    if (this.loading) {
      await this.loading;
    }

    this.loading = (async () => {
      const safeUrl = track.audioUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

      if (this.sound && this.activeSongId === track.songId) {
        const status = await this.sound.getStatusAsync();
        if (!status.isLoaded) return;

        if (status.isPlaying) {
          await this.sound.pauseAsync();
          this.setState({ isPlaying: false });
        } else {
          await this.sound.playAsync();
          this.setState({ isPlaying: true });
        }
        return;
      }

      if (this.sound) {
        await this.stopCurrent();
      }

      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: safeUrl },
          { shouldPlay: true },
          (status: any) => {
            if (!status.isLoaded) return;
            this.setState({
              songId: track.songId,
              positionMs: status.positionMillis ?? 0,
              durationMs: status.durationMillis ?? 0,
              isPlaying: status.isPlaying,
            });
          }
        );

        this.sound = newSound;
        this.activeSongId = track.songId;
        this.setState({ songId: track.songId, isPlaying: true, positionMs: 0, durationMs: 0 });
      } catch (error) {
        console.error('Playback error:', error);
      }
    })();

    try {
      await this.loading;
    } finally {
      this.loading = null;
    }
  }

  async togglePlay() {
    await this.ensureAudioMode();
    if (!this.sound) return;

    const status = await this.sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await this.sound.pauseAsync();
      this.setState({ isPlaying: false });
    } else {
      await this.sound.playAsync();
      this.setState({ isPlaying: true });
    }
  }

  private async ensureAudioMode() {
    if (this.initialized) return;
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      this.initialized = true;
    } catch (e) {
      console.warn('Failed to set audio mode:', e);
    }
  }

  async skip(amountMs: number) {
    if (!this.sound) return;

    const status = await this.sound.getStatusAsync();
    if (!status.isLoaded) return;

    const current = status.positionMillis ?? 0;
    const duration = status.durationMillis ?? current;
    const next = Math.min(Math.max(current + amountMs, 0), duration);
    await this.sound.setPositionAsync(next);
    this.setState({ positionMs: next });
  }

  async getStatus() {
    if (!this.sound) return null;
    return this.sound.getStatusAsync();
  }
}

export const audioPlayer = new AudioPlayerService();
