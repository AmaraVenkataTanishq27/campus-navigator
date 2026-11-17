import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { ScreenType } from '../types';

interface BottomTabBarProps {
  currentScreen: ScreenType;
  onTabSelect: (tab: ScreenType) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentScreen, onTabSelect }) => {
  const tabs: Array<{ key: ScreenType; label: string; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }> = [
    { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'map', label: 'Map', icon: 'map-outline', activeIcon: 'map' },
    { key: 'search', label: 'Search', icon: 'search-outline', activeIcon: 'search' },
    { key: 'directory', label: 'Directory', icon: 'business-outline', activeIcon: 'business' },
    { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onTabSelect(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? THEME.colors.primary : THEME.colors.textSecondary}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: THEME.colors.card,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    paddingHorizontal: THEME.spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...THEME.shadows.subtle,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: THEME.spacing.xs,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: THEME.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: THEME.colors.sageLight,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
});
