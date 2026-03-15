import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

/**
 * TypeScript hook to handle playing a sequence of audio chunks,
 * mimicking the display(Audio(..., autoplay=i==0)) behavior.
 */
export const useAudioSequence = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(-1);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playSequence = async (audioUrls: string[]) => {
    setIsPlaying(true);
    
    for (let i = 0; i < audioUrls.length; i++) {
      setCurrentChunkIndex(i);
      console.log(`Playing chunk ${i}: ${audioUrls[i]}`);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrls[i] },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      
      // Wait for the sound to finish playing before moving to the next
      await new Promise((resolve) => {
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            resolve(true);
          }
        });
      });

      await newSound.unloadAsync();
    }
    
    setIsPlaying(false);
    setCurrentChunkIndex(-1);
    setSound(null);
  };

  const stopSequence = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    setIsPlaying(false);
    setCurrentChunkIndex(-1);
    setSound(null);
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return { playSequence, stopSequence, isPlaying, currentChunkIndex };
};
