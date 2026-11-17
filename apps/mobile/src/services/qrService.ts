import { QRCheckpoint } from '../types';
import { QR_CHECKPOINTS_DATA } from '../data/campusData';

export interface QRScanResult {
  success: boolean;
  checkpoint?: QRCheckpoint;
  error?: string;
}

export const QrService = {
  getAllCheckpoints(): QRCheckpoint[] {
    return QR_CHECKPOINTS_DATA;
  },

  verifyAndResolveCheckpoint(qrRawData: string): QRScanResult {
    const trimmed = qrRawData.trim();
    if (!trimmed) {
      return { success: false, error: 'Empty QR code detected.' };
    }

    const checkpoint = QR_CHECKPOINTS_DATA.find(
      (cp) => cp.qrCode.toUpperCase() === trimmed.toUpperCase()
    );

    if (checkpoint) {
      return {
        success: true,
        checkpoint,
      };
    }

    // Check if it's a URL containing checkpoint query
    try {
      if (trimmed.includes('checkpoint=') || trimmed.includes('/qr/')) {
        const parts = trimmed.split(/checkpoint=|\/qr\//);
        const code = parts[1]?.split(/[&#?]/)[0];
        if (code) {
          const match = QR_CHECKPOINTS_DATA.find(
            (cp) => cp.qrCode.toUpperCase() === code.toUpperCase()
          );
          if (match) {
            return { success: true, checkpoint: match };
          }
        }
      }
    } catch (e) {
      // ignore
    }

    return {
      success: false,
      error: `Unknown checkpoint: "${trimmed}". Please scan an official Campus Navigator QR plaque.`,
    };
  },
};
