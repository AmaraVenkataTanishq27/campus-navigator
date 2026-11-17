import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useCampus } from '../context/CampusContext';
import { Header } from '../components/Header';
import { QrService, QRScanResult } from '../services/qrService';
import { NavigationService } from '../services/navigationService';
import { QRCheckpoint } from '../types';

export const QrScannerScreen: React.FC = () => {
  const {
    goBack,
    setOriginNode,
    setActiveFloorLevel,
    navigate,
    setLastScannedCheckpoint,
  } = useCampus();

  const [permission, requestPermission] = useCameraPermissions();
  const [scannedResult, setScannedResult] = useState<QRScanResult | null>(null);
  const [hasScanned, setHasScanned] = useState<boolean>(false);

  const sampleCheckpoints = QrService.getAllCheckpoints();

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (hasScanned) return;
    setHasScanned(true);

    const result = QrService.verifyAndResolveCheckpoint(data);
    setScannedResult(result);

    if (result.success && result.checkpoint) {
      applyCheckpoint(result.checkpoint);
    }
  };

  const applyCheckpoint = (cp: QRCheckpoint) => {
    const node = NavigationService.getNodeById(cp.nodeId);
    if (node) {
      setOriginNode(node);
      setActiveFloorLevel(cp.floorLevel);
      setLastScannedCheckpoint(cp);
    }
  };

  const handleSimulateScan = (cp: QRCheckpoint) => {
    const result: QRScanResult = {
      success: true,
      checkpoint: cp,
    };
    setScannedResult(result);
    setHasScanned(true);
    applyCheckpoint(cp);
  };

  const handleResetScanner = () => {
    setHasScanned(false);
    setScannedResult(null);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Scan QR Checkpoint"
        subtitle="Instant indoor location lock"
        showBack={true}
        onBackPress={goBack}
      />

      <View style={styles.scannerViewport}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
          />
        ) : (
          <View style={styles.noCameraView}>
            <Ionicons name="camera-reverse-outline" size={48} color={THEME.colors.textSecondary} />
            <Text style={styles.noCameraText}>Camera access required for live barcode scanner</Text>
            <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
              <Text style={styles.permButtonText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Viewfinder Reticle Framing */}
        <View style={styles.reticleOverlay}>
          <View style={styles.reticleBox}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <View style={styles.reticleLaser} />
          </View>
          <Text style={styles.reticlePrompt}>
            Align QR code plaque within the frame
          </Text>
        </View>

        {/* Scanned Result Modal / Bottom Drawer */}
        {scannedResult ? (
          <View style={styles.resultDrawer}>
            {scannedResult.success && scannedResult.checkpoint ? (
              <View>
                <View style={styles.resultHeader}>
                  <View style={styles.successIconBadge}>
                    <Ionicons name="checkmark" size={20} color={THEME.colors.card} />
                  </View>
                  <View style={styles.resultTitleWrap}>
                    <Text style={styles.resultTitle}>
                      {scannedResult.checkpoint.name}
                    </Text>
                    <Text style={styles.resultCode}>
                      Checkpoint: {scannedResult.checkpoint.qrCode} • Floor {scannedResult.checkpoint.floorLevel}
                    </Text>
                  </View>
                </View>
                <Text style={styles.resultDesc}>
                  {scannedResult.checkpoint.description}
                </Text>

                <View style={styles.drawerActions}>
                  <TouchableOpacity
                    style={styles.drawerNavBtn}
                    onPress={() => navigate('map')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="map" size={18} color={THEME.colors.card} />
                    <Text style={styles.drawerNavText}>View on Floor Map</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.drawerResetBtn}
                    onPress={handleResetScanner}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="scan-outline" size={18} color={THEME.colors.primary} />
                    <Text style={styles.drawerResetText}>Scan Another</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.errorTitle}>Invalid Checkpoint</Text>
                <Text style={styles.errorDesc}>{scannedResult.error}</Text>
                <TouchableOpacity
                  style={styles.drawerResetBtn}
                  onPress={handleResetScanner}
                  activeOpacity={0.8}
                >
                  <Text style={styles.drawerResetText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Simulator Quick Checkpoint Test Plaque List */}
      <View style={styles.simulatorTray}>
        <Text style={styles.trayHeading}>
          Campus QR Checkpoints (Test & Simulation Plaque Bar):
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trayScroll}
        >
          {sampleCheckpoints.map((cp) => (
            <TouchableOpacity
              key={cp.qrCode}
              style={styles.trayChip}
              onPress={() => handleSimulateScan(cp)}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code" size={14} color={THEME.colors.primary} />
              <Text style={styles.trayChipText}>{cp.qrCode}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  noCameraView: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1E2522',
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
  },
  noCameraText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
  },
  permButton: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.md,
  },
  permButtonText: {
    color: THEME.colors.card,
    fontSize: 14,
    fontWeight: '700',
  },
  reticleOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: 240,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#00E676',
  },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  reticleLaser: {
    width: '90%',
    height: 2,
    backgroundColor: 'rgba(0, 230, 118, 0.6)',
  },
  reticlePrompt: {
    color: THEME.colors.card,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.round,
  },
  resultDrawer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    ...THEME.shadows.card,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  successIconBadge: {
    width: 38,
    height: 38,
    borderRadius: THEME.borderRadius.round,
    backgroundColor: THEME.colors.destinationGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  resultTitleWrap: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  resultCode: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  resultDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: THEME.spacing.md,
  },
  drawerActions: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  drawerNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 12,
    gap: 6,
  },
  drawerNavText: {
    color: THEME.colors.card,
    fontSize: 14,
    fontWeight: '700',
  },
  drawerResetBtn: {
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.sageLight,
    borderRadius: THEME.borderRadius.md,
  },
  drawerResetText: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.dangerRed,
    marginBottom: 4,
  },
  errorDesc: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.md,
  },
  simulatorTray: {
    backgroundColor: THEME.colors.card,
    paddingVertical: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.cardBorder,
  },
  trayHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  trayScroll: {
    paddingHorizontal: THEME.spacing.lg,
    gap: THEME.spacing.sm,
  },
  trayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.sageLight,
    borderWidth: 1,
    borderColor: THEME.colors.sage,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.round,
    gap: 6,
  },
  trayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
});
