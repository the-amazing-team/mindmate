import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

interface STTComponentProps {
  onTranscriptionComplete: (text: string) => void;
  isProcessing?: boolean;
}

export const STTComponent: React.FC<STTComponentProps> = ({ onTranscriptionComplete, isProcessing }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(null);
    setIsRecording(false);
    
    if (recording) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      if (uri) {
        // Here we would normally send the file to the Whisper API
        // For now, we'll simulate a transcription
        handleTranscription(uri);
      }
    }
  }

  const handleTranscription = async (uri: string) => {
    console.log('Processing audio for Whisper...', uri);
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      // @ts-ignore - React Native FormData expects an object with uri, name, type
      formData.append('audio', {
        uri: uri,
        name: 'speech.m4a',
        type: 'audio/m4a',
      });

      // Point this to your actual backend URL (e.g. your local IP or production domain)
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${API_URL}/voice/stt`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
