import { Colors, Radius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AGE_GROUPS = [
  { id: 'teen', label: '13-17', icon: '🎒' },
  { id: 'young-adult', label: '18-24', icon: '🎓' },
  { id: 'adult', label: '25-34', icon: '💼' },
  { id: 'mature', label: '35-50', icon: '🏡' },
  { id: 'senior', label: '50+', icon: '✨' },
];

export default function SignupAgeScreen() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: '50%' }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Help us personalize your experience by selecting your age group</Text>

        <View style={styles.grid}>
          {AGE_GROUPS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.ageCard,
                selectedAge === item.id && styles.selectedCard
              ]}
              onPress={() => setSelectedAge(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.ageIcon}>{item.icon}</Text>
              <Text style={[
                styles.ageLabel,
                selectedAge === item.id && styles.selectedLabel
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.nextButton, !selectedAge && styles.disabledButton]}
          onPress={() => selectedAge && router.push({
            pathname: '/(auth)/signup-personality',
            params: { age: selectedAge }
          })}
          disabled={!selectedAge}
        >
          <LinearGradient
            colors={selectedAge ? ['#8B5CF6', '#6D28D9'] : ['#2A2A45', '#2A2A45']}
            style={styles.buttonGradient}
          >
            <Text style={styles.nextButtonText}>Next Step</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
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
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  ageCard: {
    width: (width - Spacing.xl * 2 - 16) / 2,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  ageIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  ageLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  selectedLabel: {
    color: Colors.primaryLight,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  nextButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
