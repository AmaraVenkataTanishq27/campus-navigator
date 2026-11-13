import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onClear?: () => void;
  onMicPress?: () => void;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search room, lab, or facility',
  onFocus,
  onClear,
  onMicPress,
  autoFocus = false,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={THEME.colors.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.colors.textTertiary}
        onFocus={onFocus}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} style={styles.actionButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={18} color={THEME.colors.textTertiary} />
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={onMicPress}
        style={styles.micButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="mic-outline" size={20} color={THEME.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    paddingHorizontal: THEME.spacing.md,
    height: 48,
    ...THEME.shadows.subtle,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: THEME.colors.textPrimary,
    height: '100%',
  },
  actionButton: {
    padding: THEME.spacing.xs,
  },
  micButton: {
    padding: THEME.spacing.xs,
    marginLeft: THEME.spacing.xs,
  },
});
