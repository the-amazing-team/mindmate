import { Colors, Radius, Spacing } from "@/constants/theme";
import { authService } from "@/services/auth.service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];
const PERSONALITY_TYPES = ["INTROVERT", "EXTROVERT", "AMBIVERT"];
const GOALS_OPTIONS = [
  "Stress Management",
  "Better Sleep",
  "Personal Growth",
  "Emotional Balance",
  "Focus & Productivity",
  "Relationship Health",
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [personality, setPersonality] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    async function loadProfile() {
      const currentUser = await authService.getCurrentUser(true);
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.name || "");
        setAgeGroup(currentUser.age_group || "");
        setPersonality(currentUser.personality_type || "");
        setSelectedGoals(currentUser.goals || []);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSave = async () => {
    if (!user?.email) {
      Alert.alert("Error", "User data not loaded. Please try again.");
      return;
    }
    if (!name || !ageGroup || !personality) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await authService.completeOnboarding(user.email, {
        name,
        ageGroup,
        personality,
        goals: selectedGoals,
        reminders: user.reminders || "09:00",
        notifications_enabled: user.notifications_enabled,
        reminders_enabled: user.reminders_enabled,
        weekly_insights_enabled: user.weekly_insights_enabled,
        marketing_emails_enabled: user.marketing_emails_enabled,
      });
      router.back();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update profile";
      Alert.alert("Error", errorMsg);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.saveButton}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor={Colors.dark.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Group</Text>
          <View style={styles.chipContainer}>
            {AGE_GROUPS.map((group) => (
              <TouchableOpacity
                key={group}
                style={[styles.chip, ageGroup === group && styles.selectedChip]}
                onPress={() => setAgeGroup(group)}
              >
                <Text style={[styles.chipText, ageGroup === group && styles.selectedChipText]}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personality Type</Text>
          <View style={styles.chipContainer}>
            {PERSONALITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chip, personality === type && styles.selectedChip]}
                onPress={() => setPersonality(type)}
              >
                <Text style={[styles.chipText, personality === type && styles.selectedChipText]}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Goals</Text>
          <View style={styles.chipContainer}>
            {GOALS_OPTIONS.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[styles.chip, selectedGoals.includes(goal) && styles.selectedChip]}
                onPress={() => toggleGoal(goal)}
              >
                <Text
                  style={[styles.chipText, selectedGoals.includes(goal) && styles.selectedChipText]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.dark.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  inputGroup: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  selectedChip: {
    backgroundColor: Colors.primary + "20",
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  selectedChipText: {
    color: Colors.primaryLight,
    fontWeight: "700",
  },
});
