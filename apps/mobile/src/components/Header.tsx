import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'RIT Campus Navigator',
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Ionicons name="location" size={20} color={THEME.colors.card} />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color={THEME.colors.textPrimary} />
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(23, 35, 29, 0.05)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
    ...THEME.shadows.subtle,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.colors.dangerRed,
  },
});
