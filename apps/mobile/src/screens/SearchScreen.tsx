import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CategoryChip } from '../components/CategoryChip';
import { LocationCard } from '../components/LocationCard';
import { CampusService } from '../services/campusService';
import { CategoryFilter, RoomItem } from '../types';

export const SearchScreen: React.FC = () => {
  const {
    goBack,
    selectRoomAndNavigate,
    navigate,
    setSelectedRoom,
    addRecentSearch,
  } = useCampus();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');

  const categories: CategoryFilter[] = ['All', 'Rooms', 'Labs', 'Facilities'];

  const results = CampusService.searchLocations(searchQuery, selectedCategory);

  const handleSelectRoom = (room: RoomItem) => {
    addRecentSearch(room.roomNumber);
    selectRoomAndNavigate(room);
  };

  const handleCardPress = (room: RoomItem) => {
    setSelectedRoom(room);
    navigate('location_detail');
  };

  return (
    <View style={styles.container}>
      <Header
        title="Search Campus"
        subtitle="Rooms, Labs, Offices & Facilities"
        showBack={true}
        onBackPress={goBack}
      />

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search AB 608, Physics Lab, Library..."
          onClear={() => setSearchQuery('')}
          autoFocus={false}
        />
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isSelected={selectedCategory === cat}
              onSelect={setSelectedCategory}
            />
          ))}
        </ScrollView>
      </View>

      {/* Search Results Count */}
      <View style={styles.resultsCountBar}>
        <Text style={styles.countText}>
          {results.length} {results.length === 1 ? 'location' : 'locations'} found
        </Text>
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocationCard
            room={item}
            onNavigatePress={handleSelectRoom}
            onCardPress={handleCardPress}
            showDetails={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching locations found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching by room number (e.g. "AB 608"), department name, or "Lab".
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  searchSection: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  categoriesSection: {
    paddingTop: THEME.spacing.sm,
    paddingBottom: THEME.spacing.xs,
  },
  categoryScroll: {
    paddingHorizontal: THEME.spacing.lg,
  },
  resultsCountBar: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xs,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: THEME.spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
    lineHeight: 18,
  },
});
