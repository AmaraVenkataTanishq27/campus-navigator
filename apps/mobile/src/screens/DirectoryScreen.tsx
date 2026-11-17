import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { LocationCard } from '../components/LocationCard';
import { CampusService } from '../services/campusService';
import { RoomItem } from '../types';

interface DirectoryGroup {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  filterFn: (room: RoomItem) => boolean;
}

export const DirectoryScreen: React.FC = () => {
  const { selectRoomAndNavigate, setSelectedRoom, navigate } = useCampus();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');

  const allRooms = CampusService.getAllRooms();

  const directoryGroups: DirectoryGroup[] = [
    { id: 'all', name: 'All Directory', icon: 'grid-outline', filterFn: () => true },
    {
      id: 'labs_cs',
      name: 'Computer Labs',
      icon: 'desktop-outline',
      filterFn: (r) => r.type.includes('Computer Lab') || r.name.includes('Computing'),
    },
    {
      id: 'labs_phy',
      name: 'Physics Labs',
      icon: 'flask-outline',
      filterFn: (r) => r.department === 'Department of Physics' || r.name.includes('Physics'),
    },
    {
      id: 'mca_fac',
      name: 'MCA Facilities',
      icon: 'code-slash-outline',
      filterFn: (r) => r.department === 'Department of MCA' || r.name.includes('MCA'),
    },
    {
      id: 'classrooms',
      name: 'Classrooms',
      icon: 'school-outline',
      filterFn: (r) => r.type === 'Classroom' || r.type === 'Lecture Hall',
    },
    {
      id: 'admin_offices',
      name: 'Admin Offices',
      icon: 'business-outline',
      filterFn: (r) => r.type.includes('Office') || r.type.includes('Administrative'),
    },
    {
      id: 'exam_centers',
      name: 'Exam Centres',
      icon: 'document-text-outline',
      filterFn: (r) => r.type.includes('Examination Center') || r.name.includes('Eval'),
    },
    {
      id: 'libraries',
      name: 'Libraries',
      icon: 'library-outline',
      filterFn: (r) => r.type === 'Library' || r.name.includes('Library'),
    },
    {
      id: 'counselling',
      name: 'Student Support',
      icon: 'heart-outline',
      filterFn: (r) => r.type.includes('Student Services') || r.name.includes('Counselling'),
    },
  ];

  const currentGroup = directoryGroups.find((g) => g.id === selectedGroupId) || directoryGroups[0];
  const displayedRooms = allRooms.filter(currentGroup.filterFn);

  return (
    <View style={styles.container}>
      <Header
        title="Campus Directory"
        subtitle="Browse all blocks, departments and facilities"
      />

      {/* Group Navigation Chips */}
      <View style={styles.groupScrollSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.groupScroll}
        >
          {directoryGroups.map((grp) => {
            const isSelected = grp.id === selectedGroupId;
            return (
              <TouchableOpacity
                key={grp.id}
                style={[styles.groupChip, isSelected && styles.groupChipActive]}
                onPress={() => setSelectedGroupId(grp.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={grp.icon}
                  size={16}
                  color={isSelected ? THEME.colors.card : THEME.colors.textSecondary}
                />
                <Text
                  style={[styles.groupChipText, isSelected && styles.groupChipTextActive]}
                >
                  {grp.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Directory Item List */}
      <FlatList
        data={displayedRooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LocationCard
            room={item}
            onNavigatePress={(r) => selectRoomAndNavigate(r)}
            onCardPress={(r) => {
              setSelectedRoom(r);
              navigate('location_detail');
            }}
            showDetails={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  groupScrollSection: {
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  groupScroll: {
    paddingHorizontal: THEME.spacing.lg,
    gap: THEME.spacing.sm,
  },
  groupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    gap: 6,
  },
  groupChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  groupChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  groupChipTextActive: {
    color: THEME.colors.card,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    paddingBottom: 40,
  },
});
