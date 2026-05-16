import { Colors, Radius, Spacing } from '@/constants/theme';
import { authService } from '@/services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [remindersEnabled, setRemindersEnabled] = useState(true);
    const [weeklyInsightsEnabled, setWeeklyInsightsEnabled] = useState(true);
    const [marketingEmailsEnabled, setMarketingEmailsEnabled] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const currentUser = await authService.getCurrentUser(true);
            if (currentUser) {
                setUser(currentUser);
                setNotificationsEnabled(currentUser.notifications_enabled ?? true);
                setRemindersEnabled(currentUser.reminders_enabled ?? true);
                setWeeklyInsightsEnabled(currentUser.weekly_insights_enabled ?? true);
                setMarketingEmailsEnabled(currentUser.marketing_emails_enabled ?? false);
            }
            setLoading(false);
        }
        loadProfile();
    }, []);

    const handleSave = async (updates: any) => {
        setSaving(true);
        try {
            const updatedData = {
                name: user?.name,
                ageGroup: user?.age_group || '18-24',
                personality: user?.personality_type || 'INTROVERT',
                goals: user?.goals || [],
                reminders: user?.reminders || '09:00',
                notifications_enabled: notificationsEnabled,
                reminders_enabled: remindersEnabled,
                weekly_insights_enabled: weeklyInsightsEnabled,
                marketing_emails_enabled: marketingEmailsEnabled,
                ...updates
            };

            await authService.completeOnboarding(user.email, updatedData);
        } catch (error) {
            Alert.alert('Error', 'Failed to update preferences');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const toggleSwitch = (key: string, value: boolean) => {
        switch (key) {
            case 'notifications':
                setNotificationsEnabled(value);
                handleSave({ notifications_enabled: value });
                break;
            case 'reminders':
                setRemindersEnabled(value);
                handleSave({ reminders_enabled: value });
                break;
            case 'weekly':
                setWeeklyInsightsEnabled(value);
                handleSave({ weekly_insights_enabled: value });
                break;
            case 'marketing':
                setMarketingEmailsEnabled(value);
                handleSave({ marketing_emails_enabled: value });
                break;
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
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Manage how MindMate communicates with you and stays in touch with your progress.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Notifications</Text>
                    <View style={styles.settingsGroup}>
                        <View style={styles.settingItem}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingLabel}>Push Notifications</Text>
                                <Text style={styles.settingSublabel}>Enable all push notifications</Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={(val) => toggleSwitch('notifications', val)}
                                trackColor={{ false: Colors.dark.border, true: Colors.primary }}
                                thumbColor="#FFF"
                            />
                        </View>

                        <View style={[styles.settingItem, !notificationsEnabled && styles.disabledItem]}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingLabel}>Daily Reminders</Text>
                                <Text style={styles.settingSublabel}>Gentle nudges to check-in and journal</Text>
                            </View>
                            <Switch
                                value={remindersEnabled}
                                disabled={!notificationsEnabled}
                                onValueChange={(val) => toggleSwitch('reminders', val)}
                                trackColor={{ false: Colors.dark.border, true: Colors.primary }}
                                thumbColor="#FFF"
                            />
                        </View>

                        <View style={[styles.settingItem, styles.noBorder, !notificationsEnabled && styles.disabledItem]}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingLabel}>Weekly Insights</Text>
                                <Text style={styles.settingSublabel}>Get notified when your weekly report is ready</Text>
                            </View>
                            <Switch
                                value={weeklyInsightsEnabled}
                                disabled={!notificationsEnabled}
                                onValueChange={(val) => toggleSwitch('weekly', val)}
                                trackColor={{ false: Colors.dark.border, true: Colors.primary }}
                                thumbColor="#FFF"
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Email Communication</Text>
                    <View style={styles.settingsGroup}>
                        <View style={[styles.settingItem, styles.noBorder]}>
                            <View style={styles.settingLeft}>
                                <Text style={styles.settingLabel}>Newsletter & Updates</Text>
                                <Text style={styles.settingSublabel}>Stay updated with new features and tips</Text>
                            </View>
                            <Switch
                                value={marketingEmailsEnabled}
                                onValueChange={(val) => toggleSwitch('marketing', val)}
                                trackColor={{ false: Colors.dark.border, true: Colors.primary }}
                                thumbColor="#FFF"
                            />
                        </View>
                    </View>
                </View>

                {saving && (
                    <View style={styles.savingIndicator}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.savingText}>Saving changes...</Text>
                    </View>
                )}
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        fontWeight: '700',
        color: Colors.dark.text,
    },
    scrollContent: {
        padding: Spacing.md,
    },
    infoBox: {
        backgroundColor: Colors.primary + '10',
        padding: 16,
        borderRadius: Radius.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    infoText: {
        color: Colors.primaryLight,
        fontSize: 14,
        lineHeight: 20,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.dark.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
        marginLeft: 4,
    },
    settingsGroup: {
        backgroundColor: Colors.dark.surface,
        borderRadius: Radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.dark.border,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.border,
    },
    noBorder: {
        borderBottomWidth: 0,
    },
    disabledItem: {
        opacity: 0.5,
    },
    settingLeft: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.dark.text,
    },
    settingSublabel: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    savingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
    },
    savingText: {
        color: Colors.dark.textMuted,
        fontSize: 14,
    },
});
