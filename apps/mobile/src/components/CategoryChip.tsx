import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { CategoryFilter } from '../types';

interface CategoryChipProps {
  label: CategoryFilter;
  isSelected: boolean;
  onSelect: (category: CategoryFilter) => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ label, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={() => onSelect(label)}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginRight: THEME.spacing.sm,
  },
  chipSelected: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  labelSelected: {
    color: THEME.colors.card,
  },
});
