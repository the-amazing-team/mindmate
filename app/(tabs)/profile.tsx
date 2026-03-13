import { Colors, Radius, Spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authService } from '@/services/auth.service';
import { supabase } from '@/services/supabase';
import { useFocusEffect } from 'expo-router';

const SETTINGS_GROUPS = [
  {
    title: 'Account',
    items: [
      { id: 'profile', label: 'Edit Profile', icon: '👤' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        // Fetch full profile from backend if needed
        setUser(data.user);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{user?.email?.substring(0, 2).toUpperCase() || 'JD'}</Text>
          </LinearGradient>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.user_metadata?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'jane.doe@example.com'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>MindMate Member</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Journals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Check-ins</Text>
          </View>
        </View>

        {SETTINGS_GROUPS.map((group, idx) => (
          <View key={idx} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupContent}>
              {group.items.map((item, itemIdx) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.settingItem,
                    itemIdx === group.items.length - 1 && styles.noBorder
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      <Text style={styles.settingIcon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>MindMate v1.0.0 (Build 124)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.bg,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: 10,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.dark.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  settingsGroup: {
    marginBottom: Spacing.xl,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  groupContent: {
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  proBadge: {
    backgroundColor: Colors.accent + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  proBadgeText: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '800',
  },
  chevron: {
    fontSize: 20,
    color: Colors.dark.textMuted,
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#EF4444' + '15',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EF4444' + '40',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
});
