import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface TTSComponentProps {
  text: string;
}

export const TTSComponent: React.FC<TTSComponentProps> = ({ text }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playSequence = async (audioUrls: string[]) => {
    try {
      // Stop any existing sound
      if (sound) {
        await sound.unloadAsync();
      }

      console.log('Playing audio:', audioUrls[0]);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrls[0] },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsSpeaking(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsSpeaking(false);
          newSound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsSpeaking(false);
    }
  };

  const stopSequence = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setIsSpeaking(false);
  };

  const speak = async () => {
    if (!text) return;
    
    setIsSpeaking(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Call backend Kokoro TTS
      const response = await fetch(`${API_URL}/voice/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      
      if (result.success && result.audioUrl) {
        // Construct full URL
        const fullAudioUrl = result.audioUrl.startsWith('http') 
          ? result.audioUrl 
          : `${API_URL}${result.audioUrl}`;
        
        await playSequence([fullAudioUrl]);
      } else {
        // Fallback to local expo-speech if backend fails
        console.warn('Backend TTS failed, using fallback...');
        Speech.speak(text, {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
          language: 'en-US',
        });
      }
    } catch (error) {
      console.error('TTS API Error:', error);
      // Final fallback
      Speech.speak(text, {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const stop = () => {
    stopSequence();
    Speech.stop();
  };

  return (
    <View className="flex-row items-center bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
      <TouchableOpacity
        onPress={isSpeaking ? stop : speak}
        className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center mr-4"
      >
        {isSpeaking ? (
          <Ionicons name="stop" size={24} color="white" />
        ) : (
          <Ionicons name="volume-high" size={24} color="white" />
        )}
      </TouchableOpacity>
      <View className="flex-1">
        <Text className="text-gray-400 text-xs mb-1 uppercase tracking-widest font-bold">AI Voice Output</Text>
        <Text className="text-white text-base" numberOfLines={2}>
          {text || "Awaiting response..."}
        </Text>
      </View>
    </View>
  );
};
