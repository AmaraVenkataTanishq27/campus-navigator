import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { StorageService } from '../services/storage';

export const ProfileScreen: React.FC = () => {
  const { preferences, updatePreferences } = useCampus();

  const handleClearHistory = async () => {
    await StorageService.clearRecentSearches();
    Alert.alert('History Cleared', 'Your recent search history has been wiped.');
  };

  return (
    <View style={styles.container}>
      <Header title="Profile & Preferences" subtitle="Settings & Accessibility" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarBadge}>
            <Ionicons name="person" size={28} color={THEME.colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Campus Explorer</Text>
            <Text style={styles.userRole}>Student / Faculty Visitor</Text>
            <Text style={styles.userInstitute}>RIT Main Campus • Academic Block</Text>
          </View>
        </View>

        {/* Accessibility Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Accessibility & Routing</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Avoid Stairs (Elevator Only)</Text>
              <Text style={styles.settingDesc}>
                Routes will only use elevators and flat corridor ramps.
              </Text>
            </View>
            <Switch
              value={preferences.avoidStairs}
              onValueChange={(val) => updatePreferences({ avoidStairs: val })}
              trackColor={{ false: THEME.colors.cardBorder, true: THEME.colors.primary }}
              thumbColor={THEME.colors.card}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Wheelchair Accessible Priority</Text>
              <Text style={styles.settingDesc}>
                Ensures all corridor door thresholds and transit edges meet step-free clearances.
              </Text>
            </View>
            <Switch
              value={preferences.wheelchairAccessible}
              onValueChange={(val) => updatePreferences({ wheelchairAccessible: val })}
              trackColor={{ false: THEME.colors.cardBorder, true: THEME.colors.primary }}
              thumbColor={THEME.colors.card}
            />
          </View>
        </View>

        {/* Guidance Options */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Navigation Guidance</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Voice-Guided Turn Prompts</Text>
              <Text style={styles.settingDesc}>
                Auditory cue announcements approaching corridor junctions.
              </Text>
            </View>
            <Switch
              value={preferences.voiceGuidance}
              onValueChange={(val) => updatePreferences({ voiceGuidance: val })}
              trackColor={{ false: THEME.colors.cardBorder, true: THEME.colors.primary }}
              thumbColor={THEME.colors.card}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Haptic Feedback</Text>
              <Text style={styles.settingDesc}>
                Vibration alerts at turn waypoints and target arrival.
              </Text>
            </View>
            <Switch
              value={preferences.hapticFeedback}
              onValueChange={(val) => updatePreferences({ hapticFeedback: val })}
              trackColor={{ false: THEME.colors.cardBorder, true: THEME.colors.primary }}
              thumbColor={THEME.colors.card}
            />
          </View>
        </View>

        {/* Offline Cache Status */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Offline Storage</Text>

          <View style={styles.storageStatusRow}>
            <Ionicons name="cloud-offline" size={24} color={THEME.colors.destinationGreen} />
            <View style={styles.storageTextWrap}>
              <Text style={styles.storageStatusTitle}>SQLite Cache Active</Text>
              <Text style={styles.storageStatusSub}>
                All 5 floor plan maps and navigation graphs are stored locally.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={THEME.colors.dangerRed} />
            <Text style={styles.clearBtnText}>Clear Recent Search History</Text>
          </TouchableOpacity>
        </View>

        {/* App Info & Attribution */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About Campus Navigator</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0 (Release MVP)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Target Block</Text>
            <Text style={styles.infoValue}>Academic Block (AB)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Navigation Engine</Text>
            <Text style={styles.infoValue}>A* Spatial Graph + Dijkstra</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Perception Stack</Text>
            <Text style={styles.infoValue}>DINOv2 + YOLO + PaddleOCR</Text>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    ...THEME.shadows.subtle,
  },
  avatarBadge: {
    width: 56,
    height: 56,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  userRole: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  userInstitute: {
    fontSize: 11,
    color: THEME.colors.textTertiary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    ...THEME.shadows.subtle,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.xs,
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: THEME.spacing.md,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  settingDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.cardBorder,
    marginVertical: THEME.spacing.sm,
  },
  storageStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.sageLight,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    gap: THEME.spacing.md,
  },
  storageTextWrap: {
    flex: 1,
  },
  storageStatusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primaryDark,
  },
  storageStatusSub: {
    fontSize: 12,
    color: THEME.colors.primary,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.spacing.md,
    paddingVertical: 10,
    gap: 6,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.dangerRed,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
});
