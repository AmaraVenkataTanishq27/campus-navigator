import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';

export const GuidanceScreen: React.FC = () => {
  const {
    activeRoute,
    selectedRoom,
    currentStepIndex,
    nextStep,
    prevStep,
    endNavigation,
    isNavigating,
    pauseNavigation,
    startNavigation,
    navigate,
    recalculateRoute,
  } = useCampus();

  if (!activeRoute) {
    return (
      <View style={styles.container}>
        <Header showBack={true} onBackPress={endNavigation} title="Navigation Guidance" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No active navigation route.</Text>
        </View>
      </View>
    );
  }

  const instructions = activeRoute.instructions;
  const currentStep = instructions[currentStepIndex] || instructions[0];
  const progressRatio = (currentStepIndex + 1) / instructions.length;

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'right':
        return 'arrow-forward-outline';
      case 'left':
        return 'arrow-back-outline';
      case 'elevator_up':
      case 'elevator_down':
        return 'business-outline';
      case 'stairs_up':
      case 'stairs_down':
        return 'trending-up-outline';
      case 'arrived':
        return 'checkmark-done-circle';
      default:
        return 'arrow-up-outline';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Navigating to ${selectedRoom?.roomNumber || 'Destination'}`}
        subtitle={`Floor ${activeRoute.startFloor} • ${activeRoute.totalDistanceMeters} m • ~${activeRoute.estimatedTimeMinutes} min`}
        showBack={true}
        onBackPress={endNavigation}
        rightAction={
          <TouchableOpacity
            style={styles.arToggleBtn}
            onPress={() => navigate('ar_camera')}
            activeOpacity={0.7}
          >
            <Ionicons name="camera" size={18} color={THEME.colors.primary} />
            <Text style={styles.arToggleText}>AR</Text>
          </TouchableOpacity>
        }
      />

      {/* Progress Bar with Steps */}
      <View style={styles.progressSection}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
        </View>
        <View style={styles.progressCheckpoints}>
          {instructions.map((_, idx) => (
            <View
              key={`cp_${idx}`}
              style={[
                styles.checkpointDot,
                idx <= currentStepIndex && styles.checkpointDotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Active Prominent Banner */}
        <View style={styles.activeStepCard}>
          <View style={styles.stepBadge}>
            <Ionicons
              name={getDirectionIcon(currentStep.direction) as any}
              size={28}
              color={THEME.colors.card}
            />
          </View>
          <View style={styles.activeStepInfo}>
            <Text style={styles.activeStepText}>{currentStep.instruction}</Text>
            {currentStep.distanceMeters > 0 ? (
              <Text style={styles.activeStepDistance}>
                in {currentStep.distanceMeters} meters
              </Text>
            ) : null}
          </View>
        </View>

        {/* Realistic Corridor Visual Viewport with Projected Arrow */}
        <View style={styles.corridorVisualCard}>
          <View style={styles.corridorViewport}>
            {/* Visual Floor Perspective Canvas */}
            <View style={styles.corridorFloor}>
              {/* Projected illuminated green navigation arrow */}
              <View style={styles.projectedArrow}>
                <Ionicons name="arrow-up" size={54} color="#00E676" />
                <View style={styles.arrowGlow} />
              </View>
            </View>
            <View style={styles.corridorBadge}>
              <Ionicons name="eye-outline" size={14} color={THEME.colors.card} />
              <Text style={styles.corridorBadgeText}>Visual Corridor Heading</Text>
            </View>
          </View>
        </View>

        {/* Turn-by-Turn Instruction List */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionHeading}>Route Steps</Text>
          {instructions.map((inst, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <TouchableOpacity
                key={inst.id}
                style={[
                  styles.instructionRow,
                  isCurrent && styles.instructionRowActive,
                  isCompleted && styles.instructionRowCompleted,
                ]}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.rowIcon,
                    isCurrent && styles.rowIconActive,
                    isCompleted && styles.rowIconCompleted,
                  ]}
                >
                  <Ionicons
                    name={getDirectionIcon(inst.direction) as any}
                    size={18}
                    color={
                      isCurrent
                        ? THEME.colors.primary
                        : isCompleted
                        ? THEME.colors.destinationGreen
                        : THEME.colors.textSecondary
                    }
                  />
                </View>
                <View style={styles.rowTextWrap}>
                  <Text
                    style={[
                      styles.rowInstruction,
                      isCurrent && styles.rowInstructionActive,
                      isCompleted && styles.rowInstructionCompleted,
                    ]}
                  >
                    {inst.instruction}
                  </Text>
                </View>
                {inst.distanceMeters > 0 ? (
                  <Text style={styles.rowDistance}>{inst.distanceMeters} m</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation Controls Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.stepNavBtn, currentStepIndex === 0 && styles.btnDisabled]}
          onPress={prevStep}
          disabled={currentStepIndex === 0}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainNavControl}
          onPress={isNavigating ? pauseNavigation : () => startNavigation()}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isNavigating ? 'pause' : 'play'}
            size={20}
            color={THEME.colors.card}
          />
          <Text style={styles.mainNavText}>
            {isNavigating ? 'Pause' : 'Resume'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stepNavBtn,
            currentStepIndex === instructions.length - 1 && styles.btnDisabled,
          ]}
          onPress={nextStep}
          disabled={currentStepIndex === instructions.length - 1}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={20} color={THEME.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.recalcBtn}
          onPress={recalculateRoute}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={THEME.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  arToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.sageLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.round,
    gap: 4,
  },
  arToggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  progressSection: {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: THEME.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.cardBorder,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: THEME.colors.sageLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
  },
  progressCheckpoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  checkpointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.cardBorder,
  },
  checkpointDotActive: {
    backgroundColor: THEME.colors.primary,
  },
  activeStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    padding: THEME.spacing.lg,
    ...THEME.shadows.card,
  },
  stepBadge: {
    width: 52,
    height: 52,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  activeStepInfo: {
    flex: 1,
  },
  activeStepText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    lineHeight: 24,
  },
  activeStepDistance: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  corridorVisualCard: {
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    ...THEME.shadows.subtle,
  },
  corridorViewport: {
    height: 180,
    backgroundColor: '#1E2D27',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  corridorFloor: {
    width: '100%',
    height: 110,
    backgroundColor: '#273830',
    borderTopWidth: 2,
    borderTopColor: '#394E44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectedArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowGlow: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 230, 118, 0.4)',
    marginTop: -4,
  },
  corridorBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.round,
    gap: 6,
  },
  corridorBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.card,
  },
  instructionsSection: {
    paddingHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.lg,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.sm,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  instructionRowActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.sageLight,
  },
  instructionRowCompleted: {
    opacity: 0.6,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  rowIconActive: {
    backgroundColor: THEME.colors.card,
  },
  rowIconCompleted: {
    backgroundColor: '#E8F5E9',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowInstruction: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  rowInstructionActive: {
    fontWeight: '800',
    color: THEME.colors.primaryDark,
  },
  rowInstructionCompleted: {
    textDecorationLine: 'line-through',
    color: THEME.colors.textSecondary,
  },
  rowDistance: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginLeft: THEME.spacing.sm,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 74,
    backgroundColor: THEME.colors.card,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    ...THEME.shadows.card,
  },
  stepNavBtn: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  mainNavControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
    ...THEME.shadows.subtle,
  },
  mainNavText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.card,
  },
  recalcBtn: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: THEME.colors.textSecondary,
  },
});
