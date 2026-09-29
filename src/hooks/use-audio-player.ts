import { useEffect, useState } from 'react';
import { audioPlayer, PlayerState } from '../lib/audio-player';

export function useAudioPlayer() {
  const [state, setState] = useState<PlayerState>(audioPlayer.getState());

  useEffect(() => {
    return audioPlayer.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return state;
}
