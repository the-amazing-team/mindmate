import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

interface STTComponentProps {
  onTranscriptionComplete: (text: string) => void;
  isProcessing?: boolean;
}

export const STTComponent: React.FC<STTComponentProps> = ({ onTranscriptionComplete, isProcessing }) => {
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const lastStartTimeRef = React.useRef<number>(0);

  async function startRecording() {
    try {
      if (recordingRef.current || isRecording) return;

      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        const response = await requestPermission();
        if (response.status !== 'granted') return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      lastStartTimeRef.current = Date.now();
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      recordingRef.current = null;
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    if (!recordingRef.current) return;
    
    const duration = Date.now() - lastStartTimeRef.current;
    console.log(`Stopping recording.. Duration: ${duration}ms`);
    
    const recording = recordingRef.current;
    recordingRef.current = null;
    setIsRecording(false);
    
    if (duration < 500) {
      console.log('Recording too short, discarding..');
      try { await recording.stopAndUnloadAsync(); } catch (e) {}
      return;
    }
    
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      if (uri) {
        handleTranscription(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }

  const handleTranscription = async (uri: string) => {
    console.log('Processing audio for Whisper...', uri);
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('audio', blob, 'speech.m4a');
      } else {
        // @ts-ignore - React Native FormData expects an object with uri, name, type
        formData.append('audio', {
          uri: uri,
          name: 'speech.m4a',
          type: 'audio/m4a',
        });
      }

      // Point this to your actual backend URL (e.g. your local IP or production domain)
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${API_URL}/voice/stt`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.text) {
        onTranscriptionComplete(result.text);
      } else {
        console.error('STT Error:', result.message);
        onTranscriptionComplete("Could not transcribe audio.");
      }
    } catch (error) {
      console.error('Transcription API Error:', error);
      onTranscriptionComplete("Error connecting to voice server.");
    }
  };

  return (
    <View className="items-center justify-center p-4">
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-blue-600'}`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="white" />
        )}
      </TouchableOpacity>
      <Text className="text-white mt-4 font-medium">
        {isRecording ? "Listening..." : "Tap to Speak"}
      </Text>
    </View>
  );
};
