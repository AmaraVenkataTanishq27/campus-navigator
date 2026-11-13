import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { SearchBar } from '../components/SearchBar';
import { CampusService } from '../services/campusService';
import { RoomItem } from '../types';

export const HomeScreen: React.FC = () => {
  const {
    navigate,
    selectRoomAndNavigate,
    startDemoRouteToAB608,
    recentSearches,
  } = useCampus();

  const popularDestinations = CampusService.getPopularDestinations();
  const nearbyFacilities = CampusService.getNearbyFacilities();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Campus Hero Card */}
        <View style={styles.heroContainer}>
          <View style={styles.heroBanner}>
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextContent}>
              <View style={styles.badgePill}>
                <Ionicons name="sparkles" size={12} color={THEME.colors.primary} />
                <Text style={styles.badgeText}>Academic Block (AB)</Text>
              </View>
              <Text style={styles.heroTitle}>Find. Navigate. Reach.</Text>
              <Text style={styles.heroSubtitle}>
                Your complete campus navigation assistant.
              </Text>
            </View>
          </View>
        </View>

        {/* Global Search Bar */}
        <View style={styles.searchSection}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigate('search')}
          >
            <SearchBar
              value=""
              onChangeText={() => {}}
              placeholder="Search classroom, laboratory, office or facility"
              onFocus={() => navigate('search')}
              onMicPress={() => navigate('search')}
            />
          </TouchableOpacity>
        </View>

        {/* 4 Quick Action Navigation Cards (2x2 Grid) */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => {
              startDemoRouteToAB608();
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="map" size={24} color={THEME.colors.primary} />
            </View>
            <Text style={styles.gridCardTitle}>Map Navigation</Text>
            <Text style={styles.gridCardSub}>Explore indoor maps</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigate('ar_camera')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#E1F5FE' }]}>
              <Ionicons name="camera" size={24} color="#0288D1" />
            </View>
            <Text style={styles.gridCardTitle}>Camera Nav (AR)</Text>
            <Text style={styles.gridCardSub}>Visual corridor AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigate('qr_scanner')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="qr-code" size={24} color="#F57C00" />
            </View>
            <Text style={styles.gridCardTitle}>Scan QR</Text>
            <Text style={styles.gridCardSub}>Quick location pin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigate('directory')}
            activeOpacity={0.8}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="grid" size={24} color="#7B1FA2" />
            </View>
            <Text style={styles.gridCardTitle}>Explore Campus</Text>
            <Text style={styles.gridCardSub}>Directory & Labs</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Demo Route Banner */}
        <TouchableOpacity
          style={styles.demoBanner}
          onPress={() => startDemoRouteToAB608()}
          activeOpacity={0.85}
        >
          <View style={styles.demoLeft}>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>DEMO ROUTE</Text>
            </View>
            <Text style={styles.demoTitle}>Navigate to AB 608</Text>
            <Text style={styles.demoSub}>6th Floor • Physics Wing Corridor • 85 m</Text>
          </View>
          <View style={styles.demoButton}>
            <Ionicons name="arrow-forward" size={18} color={THEME.colors.card} />
          </View>
        </TouchableOpacity>

        {/* Recently Searched Locations */}
        {recentSearches.length > 0 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Searched</Text>
              <TouchableOpacity onPress={() => navigate('search')}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScroll}
            >
              {recentSearches.map((item, idx) => (
                <TouchableOpacity
                  key={`rec_${idx}`}
                  style={styles.recentChip}
                  onPress={() => {
                    navigate('search');
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={14} color={THEME.colors.textSecondary} />
                  <Text style={styles.recentChipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Popular Destinations */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity onPress={() => navigate('directory')}>
              <Text style={styles.seeAllText}>Browse</Text>
            </TouchableOpacity>
          </View>
          {popularDestinations.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.destinationRow}
              onPress={() => selectRoomAndNavigate(room)}
              activeOpacity={0.75}
            >
              <View style={styles.rowIconBadge}>
                <Ionicons
                  name={room.category === 'Labs' ? 'flask-outline' : 'location-outline'}
                  size={18}
                  color={THEME.colors.primary}
                />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>{room.name}</Text>
                <Text style={styles.rowSub}>
                  Floor {room.floorLevel} • {room.type}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={THEME.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Nearby Facilities */}
        <View style={[styles.sectionContainer, { marginBottom: THEME.spacing.xxl }]}>
          <Text style={styles.sectionTitle}>Campus Facilities</Text>
          <View style={styles.facilityPillContainer}>
            {nearbyFacilities.map((fac) => (
              <TouchableOpacity
                key={fac.id}
                style={styles.facilityPill}
                onPress={() => selectRoomAndNavigate(fac)}
                activeOpacity={0.7}
              >
                <Ionicons name="business" size={14} color={THEME.colors.destinationGreen} />
                <Text style={styles.facilityPillText}>{fac.roomNumber}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  heroBanner: {
    height: 160,
    borderRadius: THEME.borderRadius.xl,
    backgroundColor: THEME.colors.primaryDark,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: THEME.spacing.xl,
    ...THEME.shadows.card,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(21, 91, 67, 0.92)',
  },
  heroTextContent: {
    zIndex: 2,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.round,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    marginBottom: THEME.spacing.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.card,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: THEME.colors.sage,
    marginTop: 4,
    lineHeight: 18,
  },
  searchSection: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  gridCard: {
    width: '47.5%',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    ...THEME.shadows.subtle,
  },
  gridIconBadge: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  gridCardSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  demoBanner: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
    backgroundColor: THEME.colors.sageLight,
    borderWidth: 1,
    borderColor: THEME.colors.sage,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demoLeft: {
    flex: 1,
  },
  demoBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  demoBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.card,
    letterSpacing: 0.5,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  demoSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  demoButton: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginTop: THEME.spacing.xl,
    paddingHorizontal: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  chipsScroll: {
    gap: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.round,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  recentChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    ...THEME.shadows.subtle,
  },
  rowIconBadge: {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  rowSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  facilityPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  facilityPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
});
