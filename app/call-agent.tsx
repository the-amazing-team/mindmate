import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated, Easing } from 'react-native';
import { STTComponent } from '@/components/voice/SpeechToText';
import { TTSComponent } from '@/components/voice/TextToSpeech';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

export default function CallAgentScreen() {
  const [transcription, setTranscription] = useState("");
  const [aiResponse, setAiResponse] = useState("Hello! I am your AI Call Agent. How can I help you today?");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  
  // Animation for the pulse effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const handleTranscription = (text: string) => {
    if (!text || text.trim() === "") return;
    
    setTranscription(text);
    setIsProcessing(true);
    
    // Simulate AI logic/Call Agent processing
    // In a real app, this would send text to an LLM like GPT-4 or Gemini
    setTimeout(() => {
      const responses = [
        `I understand you're saying: "${text}". How can I help further?`,
        `Got it. You said: "${text}". I've recorded this in your journal.`,
        `Processing your request: "${text}". Our Whisper and Kokoro integration is working perfectly!`,
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setAiResponse(randomResponse);
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0D0D14]">
      <View className="flex-1 px-6 pt-10">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-12">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Call Agent</Text>
          <View className="w-10" />
        </View>

        {/* AI Visualization */}
        <View className="flex-1 items-center justify-center -mt-20">
          <Animated.View 
            style={{ transform: [{ scale: pulseAnim }] }}
            className="w-40 h-40 rounded-full bg-indigo-500/20 items-center justify-center border border-indigo-500/30"
          >
            <View className="w-32 h-32 rounded-full bg-indigo-600/40 items-center justify-center">
              <View className="w-24 h-24 rounded-full bg-indigo-600 items-center justify-center shadow-2xl shadow-indigo-500">
                <Ionicons name="mic" size={48} color="white" />
              </View>
            </View>
          </Animated.View>
          
          <Text className="text-indigo-400 mt-8 text-lg font-medium">
            {isProcessing ? "Processing..." : "MindMate AI is listening"}
          </Text>
        </View>

        {/* Transcription and Response */}
        <View className="mb-10 space-y-6">
          {transcription ? (
            <View className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50 mb-4">
              <Text className="text-gray-400 text-xs uppercase mb-1 font-bold">You said</Text>
              <Text className="text-white italic">"{transcription}"</Text>
            </View>
          ) : null}

          <TTSComponent text={aiResponse} />
          
          <View className="h-6" />
          
          <STTComponent 
            onTranscriptionComplete={handleTranscription} 
            isProcessing={isProcessing}
          />
        </View>

        {/* Bottom controls */}
        <View className="flex-row justify-center space-x-12 pb-10">
          <TouchableOpacity className="items-center">
            <View className="w-14 h-14 rounded-full bg-gray-800 items-center justify-center border border-gray-700">
              <Ionicons name="settings-outline" size={24} color="white" />
            </View>
            <Text className="text-gray-400 text-xs mt-2">Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center" onPress={() => router.back()}>
            <View className="w-14 h-14 rounded-full bg-red-500/20 items-center justify-center border border-red-500/30">
              <Ionicons name="close" size={24} color="#ff4444" />
            </View>
            <Text className="text-red-400 text-xs mt-2">End Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
