import { Colors, Radius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '@/services/auth.service';
import { useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

const QUESTIONS = [
  { id: 1, text: "I am the life of the party.", trait: "EXTRAVERSION" },
  { id: 2, text: "I sympathize with others' feelings.", trait: "AGREEABLENESS" },
  { id: 3, text: "I am always prepared.", trait: "CONSCIENTIOUSNESS" },
  { id: 4, text: "I get upset easily.", trait: "NEUROTICISM" },
  { id: 5, text: "I have a rich vocabulary.", trait: "OPENNESS" },
];

const OPTIONS = [
  { label: 'Disagree', value: 1, color: '#EF4444' },
  { label: 'Neutral', value: 3, color: '#9B9BC0' },
  { label: 'Agree', value: 5, color: '#10B981' },
];

export default function SignupPersonalityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email, name, password, age_group } = params as any;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleAnswer = async (value: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: value };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
      Animated.timing(progressAnim, {
        toValue: (currentStep + 1) / QUESTIONS.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Completed - Perform real signup and sync
      setLoading(true);
      try {
        // 1. Sign up with Supabase and sync with backend
        await authService.signUp(email, password, name);
        
        // 2. Identify primary personality trait (highest score)
        // For simplicity, we'll just take the mapping from the last question's trait 
        // or a more complex calculation if needed.
        const personality = QUESTIONS[currentStep].trait;

        // 3. Update personality and age in backend
        await authService.updatePersonality(email, age_group, personality);

        router.replace('/(tabs)/chat');
      } catch (error: any) {
        Alert.alert('Signup Error', error.message || 'Failed to complete registration');
      } finally {
        setLoading(false);
      }
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.stepText}>{currentStep + 1}/{QUESTIONS.length}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.traitLabel}>{QUESTIONS[currentStep].trait}</Text>
        <Text style={styles.questionText}>{QUESTIONS[currentStep].text}</Text>

        <View style={styles.optionsContainer}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.optionButton}
              onPress={() => handleAnswer(opt.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.optionCircle, { borderColor: opt.color }]}>
                {answers[QUESTIONS[currentStep].id] === opt.value && (
                  <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
                )}
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          This helps us understand your personality type to provide better emotional support.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    marginBottom: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    color: Colors.dark.text,
    fontSize: 24,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.dark.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  stepText: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    width: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  traitLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryLight,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 60,
  },
  optionsContainer: {
    width: '100%',
    gap: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: 20,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  infoBox: {
    margin: Spacing.xl,
    padding: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  infoText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
