import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.dark.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive, { borderColor: focused ? Colors.primary : 'transparent' }]}>
              <Text style={[styles.iconText, { color: focused ? Colors.primary : Colors.dark.textMuted }]}>◈</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={[styles.iconText, { color: focused ? '#8B5CF6' : Colors.dark.textMuted }]}>✦</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={[styles.iconText, { color: focused ? '#06B6D4' : Colors.dark.textMuted }]}>◎</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: 'Panic',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, styles.panicIconContainer, focused && styles.panicIconContainerActive]}>
              <Text style={[styles.iconText, { color: focused ? '#EF4444' : '#EF444480' }]}>🆘</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="plugins"
        options={{
          title: 'Plugins',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={[styles.iconText, { color: focused ? '#10B981' : Colors.dark.textMuted }]}>⬡</Text>
            </View>
          ),
        }}
      />
      {/* Hide the index tab as it will be redirected or unused */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.dark.surface,
    borderTopColor: Colors.dark.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    height: Platform.OS === 'ios' ? 85 : 64,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 0,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  panicIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  panicIconContainerActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
