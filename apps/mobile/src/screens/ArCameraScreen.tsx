import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { VisionService, VisionRecognitionPrediction } from '../services/visionService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ArCameraScreen: React.FC = () => {
  const {
    goBack,
    selectedRoom,
    activeRoute,
    navigate,
  } = useCampus();

  const [permission, requestPermission] = useCameraPermissions();
  const [prediction, setPrediction] = useState<VisionRecognitionPrediction | null>(null);

  useEffect(() => {
    // Run visual recognition simulation on screen entry
    VisionService.recognizeCorridorView(undefined, selectedRoom?.roomNumber || 'AB 608').then(
      setPrediction
    );
  }, [selectedRoom]);

  const targetRoomName = selectedRoom ? selectedRoom.roomNumber : 'AB 608';
  const targetFloor = selectedRoom ? selectedRoom.floorLevel : '6';

  return (
    <View style={styles.container}>
      <Header
        title="Camera Navigation (AR)"
        subtitle="Visual Corridor Guidance"
        showBack={true}
        onBackPress={goBack}
        rightAction={
          <TouchableOpacity
            style={styles.qrHeaderBtn}
            onPress={() => navigate('qr_scanner')}
            activeOpacity={0.7}
          >
            <Ionicons name="qr-code-outline" size={20} color={THEME.colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.viewport}>
        {/* Real Camera Preview (or Simulation fallback on Web/Simulator) */}
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="back" />
        ) : (
          <View style={styles.simulatedCameraBackdrop}>
            <View style={styles.corridorWallLeft} />
            <View style={styles.corridorWallRight} />
            <View style={styles.corridorFloorPlane} />
            <View style={styles.simulatedDoorFrame}>
              <View style={styles.doorPlate}>
                <Text style={styles.doorPlateText}>{targetRoomName}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Permission Request Prompt if not granted */}
        {!permission?.granted ? (
          <View style={styles.permissionOverlay}>
            <Ionicons name="camera-outline" size={28} color={THEME.colors.card} />
            <Text style={styles.permissionText}>Camera access required for live AR feed</Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Enable Camera</Text>
            </TouchableOpacity>
            <Text style={styles.permissionNote}>
              (Displaying calibrated corridor simulation overlay)
            </Text>
          </View>
        ) : null}

        {/* Top Floating Instruction HUD Card */}
        <View style={styles.hudCard}>
          <View style={styles.hudTurnBadge}>
            <Ionicons name="arrow-forward" size={24} color={THEME.colors.card} />
          </View>
          <View style={styles.hudTextContent}>
            <Text style={styles.hudTitle}>Turn right in 5 m</Text>
            <Text style={styles.hudSub}>towards {targetRoomName} (North Corridor)</Text>
          </View>
        </View>

        {/* Simulated Projected AR Chevrons on Floor */}
        <View style={styles.floorChevronsContainer}>
          <View style={[styles.chevronItem, { opacity: 0.9, transform: [{ scale: 1.2 }] }]}>
            <Ionicons name="chevron-up" size={54} color="#00E676" />
          </View>
          <View style={[styles.chevronItem, { opacity: 0.7, transform: [{ scale: 1.0 }] }]}>
            <Ionicons name="chevron-up" size={46} color="#00E676" />
          </View>
          <View style={[styles.chevronItem, { opacity: 0.5, transform: [{ scale: 0.8 }] }]}>
            <Ionicons name="chevron-up" size={38} color="#00E676" />
          </View>
        </View>

        {/* AI Landmark / Door Detection Bounding Box */}
        {prediction?.boundingBox ? (
          <View
            style={[
              styles.detectionBox,
              {
                right: '12%',
                top: '25%',
                width: 130,
                height: 220,
              },
            ]}
          >
            {/* Corner Bracket Accents */}
            <View style={[styles.boxCorner, styles.cornerTL]} />
            <View style={[styles.boxCorner, styles.cornerTR]} />
            <View style={[styles.boxCorner, styles.cornerBL]} />
            <View style={[styles.boxCorner, styles.cornerBR]} />

            {/* Floating Room Marker Pin */}
            <View style={styles.floatingMarker}>
              <Ionicons name="location" size={26} color="#00E676" />
              <View style={styles.markerTag}>
                <Text style={styles.markerTagText}>{prediction.detectedRoomNumber}</Text>
              </View>
            </View>

            {/* AI Confidence Tag */}
            <View style={styles.aiTag}>
              <Text style={styles.aiTagText}>
                {Math.round(prediction.confidence * 100)}% Match
              </Text>
            </View>
          </View>
        ) : null}

        {/* Bottom Status / Navigation HUD */}
        <View style={styles.bottomHud}>
          <View style={styles.hudMetricsRow}>
            <View style={styles.metricItem}>
              <Ionicons name="walk" size={18} color={THEME.colors.card} />
              <Text style={styles.metricText}>
                ~{activeRoute?.estimatedTimeMinutes || 2} min • {activeRoute?.totalDistanceMeters || 85} m
              </Text>
            </View>
            <View style={styles.floorBadge}>
              <Text style={styles.floorBadgeText}>Floor {targetFloor}</Text>
            </View>
          </View>

          {/* AI Architecture Label */}
          <View style={styles.aiPipelineNotice}>
            <Ionicons name="hardware-chip-outline" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={styles.aiPipelineText}>
              Vision Stack: DINOv2 + YOLO + PaddleOCR (Demonstration Mode)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  qrHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  simulatedCameraBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#263238',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corridorWallLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: '#37474F',
    borderRightWidth: 1,
    borderRightColor: '#455A64',
  },
  corridorWallRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: '#37474F',
    borderLeftWidth: 1,
    borderLeftColor: '#455A64',
  },
  corridorFloorPlane: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#1E272C',
    borderTopWidth: 2,
    borderTopColor: '#455A64',
  },
  simulatedDoorFrame: {
    position: 'absolute',
    right: '12%',
    top: '25%',
    width: 130,
    height: 220,
    backgroundColor: '#4E342E',
    borderWidth: 3,
    borderColor: '#3E2723',
    alignItems: 'center',
    paddingTop: 16,
  },
  doorPlate: {
    backgroundColor: '#004D40',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#80CBC4',
  },
  doorPlateText: {
    color: '#E0F2F1',
    fontWeight: '800',
    fontSize: 12,
  },
  permissionOverlay: {
    position: 'absolute',
    top: '35%',
    left: THEME.spacing.xl,
    right: THEME.spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  permissionText: {
    color: THEME.colors.card,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
  },
  permissionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.md,
  },
  permissionBtnText: {
    color: THEME.colors.card,
    fontSize: 13,
    fontWeight: '700',
  },
  permissionNote: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 8,
  },
  hudCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(18, 70, 50, 0.92)',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    ...THEME.shadows.card,
  },
  hudTurnBadge: {
    width: 44,
    height: 44,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.destinationGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  hudTextContent: {
    flex: 1,
  },
  hudTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.card,
  },
  hudSub: {
    fontSize: 12,
    color: THEME.colors.sage,
    marginTop: 2,
  },
  floorChevronsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronItem: {
    marginVertical: -16,
  },
  detectionBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00E676',
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderRadius: 8,
  },
  boxCorner: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderColor: '#00E676',
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  floatingMarker: {
    position: 'absolute',
    top: -38,
    left: '50%',
    marginLeft: -13,
    alignItems: 'center',
  },
  markerTag: {
    backgroundColor: '#00E676',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: -4,
  },
  markerTagText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  aiTag: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTagText: {
    color: '#00E676',
    fontSize: 9,
    fontWeight: '700',
  },
  bottomHud: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hudMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.card,
  },
  floorBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.round,
  },
  floorBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.card,
  },
  aiPipelineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 6,
  },
  aiPipelineText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
});
