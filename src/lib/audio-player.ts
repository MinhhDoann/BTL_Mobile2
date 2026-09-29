import { Audio } from 'expo-av';
import { recordSongPlay } from './api/artist-api';

export type AudioTrack = {
  songId: number;
  audioUrl: string;
  title?: string;
  artistName?: string;
  coverUrl?: string;
};

export type PlayerState = {
  songId: number | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  title?: string;
  artistName?: string;
  coverUrl?: string;
};

type Listener = (state: PlayerState) => void;

class AudioPlayerService {
  private sound: any = null;
  private activeSongId: number | null = null;
  private listeners = new Set<Listener>();
  private initialized = false;
  // Every load gets a unique id. Status events from an older sound are ignored.
  private playbackVersion = 0;
  private state: PlayerState = {
    songId: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    title: undefined,
    artistName: undefined,
    coverUrl: undefined,
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
    const soundToStop = this.sound;
    // Detach the old player before awaiting native calls. This resets the UI
    // immediately and prevents late status events from the old track winning.
    this.playbackVersion += 1;
    this.sound = null;
    this.activeSongId = null;
    this.setState({
      songId: null,
      isPlaying: false,
      positionMs: 0,
      durationMs: 0,
      title: undefined,
      artistName: undefined,
      coverUrl: undefined,
    });

    if (!soundToStop) return;

    try {
      await soundToStop.stopAsync();
      await soundToStop.unloadAsync();
    } catch (error) {
      console.warn('Stop current sound failed:', error);
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
        const playbackVersion = ++this.playbackVersion;
        const { sound: newSound, status: initialStatus } = await Audio.Sound.createAsync(
          { uri: safeUrl },
          { shouldPlay: true },
          (status: any) => {
            if (!status.isLoaded) return;
            if (playbackVersion !== this.playbackVersion) return;
            this.setState({
              songId: track.songId,
              positionMs: status.positionMillis ?? 0,
              durationMs: status.durationMillis ?? 0,
              isPlaying: status.isPlaying,
              title: track.title ?? this.state.title,
              artistName: track.artistName ?? this.state.artistName,
              coverUrl: track.coverUrl ?? this.state.coverUrl,
            });
          }
        );

        if (playbackVersion !== this.playbackVersion) {
          await newSound.unloadAsync();
          return;
        }

        this.sound = newSound;
        this.activeSongId = track.songId;
        void recordSongPlay(track.songId);
        if (initialStatus.isLoaded) {
          this.setState({
            songId: track.songId,
            isPlaying: initialStatus.isPlaying,
            positionMs: initialStatus.positionMillis ?? 0,
            durationMs: initialStatus.durationMillis ?? 0,
            title: track.title,
            artistName: track.artistName,
            coverUrl: track.coverUrl,
          });
        }
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
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      this.initialized = true;
    } catch (e) {
      console.warn('Failed to set audio mode:', e);
      this.initialized = true;
    }
  }

  async skip(amountMs: number) {
    if (!this.sound || !Number.isFinite(amountMs)) return;

    try {
      const status = await this.sound.getStatusAsync();
      if (!status.isLoaded) return;

      const current = status.positionMillis && Number.isFinite(status.positionMillis) ? status.positionMillis : 0;
      const duration = status.durationMillis && Number.isFinite(status.durationMillis) ? status.durationMillis : current;
      const next = Math.round(Math.min(Math.max(current + amountMs, 0), duration));

      if (Number.isFinite(next)) {
        await this.sound.setPositionAsync(next);
        this.setState({ positionMs: next });
      }
    } catch (e) {
      console.warn('skip error:', e);
    }
  }

  async seekTo(positionMs: number) {
    if (!this.sound || !Number.isFinite(positionMs)) return;

    try {
      const status = await this.sound.getStatusAsync();
      if (!status.isLoaded) return;

      const duration = status.durationMillis && Number.isFinite(status.durationMillis) ? status.durationMillis : positionMs;
      const next = Math.round(Math.min(Math.max(positionMs, 0), duration));

      if (Number.isFinite(next)) {
        await this.sound.setPositionAsync(next);
        this.setState({ positionMs: next });
      }
    } catch (e) {
      console.warn('seekTo error:', e);
    }
  }

  async getStatus() {
    if (!this.sound) return null;
    return this.sound.getStatusAsync();
  }
}

export const audioPlayer = new AudioPlayerService();
