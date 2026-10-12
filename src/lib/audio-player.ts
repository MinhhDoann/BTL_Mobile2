import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { recordSongPlay } from './api/artist-api';
import { detectApiBase } from './api/detectApi';

export type AudioTrack = {
  songId: number;
  audioUrl: string;
  title?: string;
  coverUrl?: string | null;
  artist?: string;
  userId?: number | null;
};

export type PlayerState = {
  songId: number | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  title?: string;
  coverUrl?: string | null;
  artist?: string;
  queue: AudioTrack[];
  currentIndex: number;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
};

type Listener = (state: PlayerState) => void;

class AudioPlayerService {
  private sound: any = null;
  private activeSongId: number | null = null;
  private listeners = new Set<Listener>();
  private initialized = false;
  // Every load gets a unique id. Status events from an older sound are ignored.
  private playbackVersion = 0;
  private queue: AudioTrack[] = [];
  private currentIndex = -1;
  private repeatMode: 'off' | 'all' | 'one' = 'off';
  private isShuffle = false;
  private state: PlayerState = {
    songId: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    title: undefined,
    artist: undefined,
    coverUrl: undefined,
    queue: [],
    currentIndex: -1,
    repeatMode: 'off',
    isShuffle: false,
  };
  private loading: Promise<void> | null = null;
  private hasRecordedPlayForSongId: number | null = null;
  private currentUserId: number | null = null;

  setUserId(id: number | null | undefined) {
    this.currentUserId = id ?? null;
  }

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
      coverUrl: undefined,
      artist: undefined,
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
      // Sync queue with currently playing track
      const existingIdx = this.queue.findIndex((t) => Number(t.songId) === Number(track.songId));
      if (existingIdx >= 0) {
        this.currentIndex = existingIdx;
      } else {
        // If track is not in queue, insert it at current position or make single track queue
        if (this.queue.length === 0) {
          this.queue = [track];
          this.currentIndex = 0;
        } else {
          this.queue.splice(this.currentIndex + 1, 0, track);
          this.currentIndex += 1;
        }
      }

      this.setState({
        queue: this.queue,
        currentIndex: this.currentIndex,
      });

      let safeUrl = track.audioUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';

      const apiBase = await detectApiBase();
      if (safeUrl.startsWith('/')) {
        safeUrl = `${apiBase}${safeUrl}`;
      } else if (safeUrl.includes('/uploads/')) {
        const uploadsIndex = safeUrl.indexOf('/uploads/');
        safeUrl = `${apiBase}${safeUrl.substring(uploadsIndex)}`;
      }

      console.log('[AudioPlayer] Loading track URL:', safeUrl);

      // Basic validation for URL
      if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://') && !safeUrl.startsWith('file://')) {
        console.warn('Invalid audio URL format:', safeUrl);
        // Fallback to a valid URL to avoid crashing Expo/iOS player with code -1002
        safeUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3';
      }

      if (this.sound && Number(this.activeSongId) === Number(track.songId)) {
        const status = await this.sound.getStatusAsync();
        if (!this.sound) return; // Fix race condition: sound was stopped while awaiting status
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

            // Tự động phát bài tiếp theo khi kết thúc bài hát
            if (status.didJustFinish && !status.isLooping) {
              void this.handleTrackEnded();
              return;
            }

            this.setState({
              songId: Number(track.songId),
              positionMs: status.positionMillis ?? 0,
              durationMs: status.durationMillis ?? 0,
              isPlaying: status.isPlaying,
              title: track.title ?? this.state.title,
              artist: track.artist ?? this.state.artist,
              coverUrl: track.coverUrl ?? this.state.coverUrl,
            });

            if (status.isPlaying && this.hasRecordedPlayForSongId !== Number(track.songId)) {
              this.hasRecordedPlayForSongId = Number(track.songId);
              void recordSongPlay(Number(track.songId), this.currentUserId);
            }
          }
        );

        if (playbackVersion !== this.playbackVersion) {
          await newSound.unloadAsync();
          return;
        }

        this.sound = newSound;
        this.activeSongId = Number(track.songId);

        if (initialStatus.isLoaded) {
          this.setState({
            songId: Number(track.songId),
            isPlaying: initialStatus.isPlaying,
            positionMs: initialStatus.positionMillis ?? 0,
            durationMs: initialStatus.durationMillis ?? 0,
            title: track.title,
            coverUrl: track.coverUrl,
            artist: track.artist,
            queue: this.queue,
            currentIndex: this.currentIndex,
          });

          if (initialStatus.isPlaying && this.hasRecordedPlayForSongId !== Number(track.songId)) {
            this.hasRecordedPlayForSongId = Number(track.songId);
            void recordSongPlay(Number(track.songId), this.currentUserId);
          }
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

  private async handleTrackEnded() {
    if (this.repeatMode === 'one') {
      if (this.sound) {
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();
        this.setState({ isPlaying: true, positionMs: 0 });
      }
      return;
    }

    await this.playNext(true);
  }

  async playNext(fromAutoEnd = false) {
    if (this.queue.length === 0) return;

    let nextIndex = this.currentIndex + 1;

    if (this.isShuffle && this.queue.length > 1) {
      let rand = Math.floor(Math.random() * this.queue.length);
      while (rand === this.currentIndex && this.queue.length > 1) {
        rand = Math.floor(Math.random() * this.queue.length);
      }
      nextIndex = rand;
    }

    if (nextIndex >= this.queue.length) {
      if (this.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        if (fromAutoEnd) {
          this.setState({ isPlaying: false, positionMs: this.state.durationMs });
          return;
        }
        nextIndex = 0;
      }
    }

    this.currentIndex = nextIndex;
    const nextTrack = this.queue[nextIndex];
    if (nextTrack) {
      await this.playTrack(nextTrack);
    }
  }

  async playPrevious() {
    if (this.queue.length === 0) return;

    // Nếu bài đã phát hơn 3s thì phát lại từ đầu
    if (this.state.positionMs > 3000 && this.sound) {
      await this.seekTo(0);
      return;
    }

    let prevIndex = this.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.queue.length - 1;
    }

    this.currentIndex = prevIndex;
    const prevTrack = this.queue[prevIndex];
    if (prevTrack) {
      await this.playTrack(prevTrack);
    }
  }

  async playIndex(index: number) {
    if (index < 0 || index >= this.queue.length) return;
    this.currentIndex = index;
    const track = this.queue[index];
    if (track) {
      await this.playTrack(track);
    }
  }

  async setQueue(tracks: AudioTrack[], startIndex = 0) {
    this.queue = [...tracks];
    this.currentIndex = startIndex;
    this.setState({
      queue: this.queue,
      currentIndex: this.currentIndex,
    });
    if (tracks[startIndex]) {
      await this.playTrack(tracks[startIndex]);
    }
  }

  setRepeatMode(mode: 'off' | 'all' | 'one') {
    this.repeatMode = mode;
    this.setState({ repeatMode: mode });
  }

  setShuffle(shuffle: boolean) {
    this.isShuffle = shuffle;
    this.setState({ isShuffle: shuffle });
  }

  getQueue(): AudioTrack[] {
    return [...this.queue];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  async togglePlay() {
    await this.ensureAudioMode();
    if (!this.sound) return;

    const status = await this.sound.getStatusAsync();
    if (!this.sound) return;
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
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
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
      if (!this.sound) return;
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
      if (!this.sound) return;
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
