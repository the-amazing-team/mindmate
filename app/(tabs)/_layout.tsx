import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <View style={[styles.emojiWrap, focused && styles.emojiWrapFocused]}>
        <View style={{ opacity: 1 }}>
          {/* Using text for emoji icons to avoid SF Symbol deps */}
        </View>
      </View>
    </View>
  );
}

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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <View style={[styles.iconDot, { backgroundColor: focused ? Colors.primary : 'transparent' }]} />
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
              <View style={[styles.iconDot, { backgroundColor: focused ? Colors.primary : 'transparent' }]} />
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
              <View style={[styles.iconDot, { backgroundColor: focused ? Colors.primary : 'transparent' }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <View style={[styles.iconDot, { backgroundColor: focused ? Colors.primary : 'transparent' }]} />
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
              <View style={[styles.iconDot, { backgroundColor: focused ? Colors.primary : 'transparent' }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="panic"
        options={{
          title: 'Panic',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <View style={[styles.iconDot, { backgroundColor: focused ? Colors.primary : 'transparent' }]} />
            </View>
          ),
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
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  tabIconFocused: {},
  emojiWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrapFocused: {
    backgroundColor: Colors.primary + '20',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.primary + '20',
  },
  iconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
