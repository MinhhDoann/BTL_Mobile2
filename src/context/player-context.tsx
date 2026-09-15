import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { SongData } from '../components/ui/song-item';

interface PlayerContextType {
  currentSong: SongData | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLiked: boolean;
  playlist: SongData[];
  currentIndex: number;
  playSong: (song: SongData, songList?: SongData[]) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleLike: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Initial default song (Anh Là Ai - Phương Ly as in user image)
export const DEFAULT_SONG: SongData = {
  song_id: 1,
  title: 'Anh Là Ai',
  artist_name: 'Phương Ly',
  cover_url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
  audio_url: 'https://github.com/MinhhDoann/BTL_Mobile2/raw/refs/heads/SongLink/nguoidautien_jukysan.mp3',
  duration: 210,
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<SongData | null>(DEFAULT_SONG);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(46); // Demo default time 0:46 as in screenshot
  const [duration, setDuration] = useState<number>(278); // Demo duration 4:38 (278s) as in screenshot
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(true);
  const [playlist, setPlaylist] = useState<SongData[]>([DEFAULT_SONG]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize Web Audio if running on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const audio = new Audio();
      audioRef.current = audio;

      audio.onended = () => {
        nextSong();
      };

      audio.ontimeupdate = () => {
        if (audio.currentTime) {
          setCurrentTime(Math.floor(audio.currentTime));
        }
      };

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(Math.floor(audio.duration));
        }
      };

      return () => {
        audio.pause();
      };
    }
  }, []);

  // Sync volume with Web Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Playback Interval timer for cross-platform simulation & fallback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          if (prevTime >= duration) {
            nextSong();
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  const playSong = (song: SongData, songList?: SongData[]) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(song.duration || 210);

    if (songList && songList.length > 0) {
      setPlaylist(songList);
      const idx = songList.findIndex((s) => s.song_id === song.song_id);
      setCurrentIndex(idx !== -1 ? idx : 0);
    } else {
      setPlaylist([song]);
      setCurrentIndex(0);
    }

    // Call API increment play count if BE available
    fetch(`http://localhost:3000/api/songs/${song.song_id}/play`, { method: 'POST' }).catch(() => {});

    // Web Audio playback
    if (audioRef.current && song.audio_url) {
      try {
        audioRef.current.src = song.audio_url;
        audioRef.current.play().catch(() => {
          // Playback blocked or offline link fallback
        });
      } catch (e) {
        console.log('Web audio play error:', e);
      }
    }
  };

  const togglePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (audioRef.current) {
      if (nextState) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  const seekTo = (seconds: number) => {
    const validSec = Math.max(0, Math.min(seconds, duration));
    setCurrentTime(validSec);
    if (audioRef.current) {
      audioRef.current.currentTime = validSec;
    }
  };

  const nextSong = () => {
    if (playlist.length === 0) return;
    const nextIdx = (currentIndex + 1) % playlist.length;
    const nextItem = playlist[nextIdx];
    setCurrentIndex(nextIdx);
    playSong(nextItem, playlist);
  };

  const prevSong = () => {
    if (playlist.length === 0) return;
    const prevIdx = (currentIndex - 1 + playlist.length) % playlist.length;
    const prevItem = playlist[prevIdx];
    setCurrentIndex(prevIdx);
    playSong(prevItem, playlist);
  };

  const setVolume = (vol: number) => {
    setVolumeState(vol);
    if (vol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isLiked,
        playlist,
        currentIndex,
        playSong,
        togglePlayPause,
        seekTo,
        nextSong,
        prevSong,
        setVolume,
        toggleMute,
        toggleLike,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
