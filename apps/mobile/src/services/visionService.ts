export interface VisionRecognitionPrediction {
  detectedRoomNumber: string;
  matchedRoomId: string;
  floorLevel: string;
  confidence: number; // 0.0 - 1.0
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarkName: string;
  isAiDemonstration: boolean;
  modelPipeline: string;
}

export const VisionService = {
  /**
   * Abstraction layer interface for future DINOv2 + FAISS + PaddleOCR + YOLO backend integration.
   * Currently runs in a calibrated demonstration mode with honest labeling as requested.
   */
  async recognizeCorridorView(
    _imageUri?: string,
    targetRoomHint: string = 'AB 608'
  ): Promise<VisionRecognitionPrediction> {
    // Simulate AI inference latency
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Return calibrated visual localization for the demo landmark
    return {
      detectedRoomNumber: targetRoomHint,
      matchedRoomId: 'AB_608',
      floorLevel: '6',
      confidence: 0.948, // 94.8% match
      boundingBox: {
        x: 0.65,
        y: 0.22,
        width: 0.28,
        height: 0.48,
      },
      landmarkName: 'Door Plate: AB 608 Classroom',
      isAiDemonstration: true,
      modelPipeline: 'DINOv2 (FAISS) + YOLOv8 + PaddleOCR (Simulated Architecture)',
    };
  },

  getAvailableVisionModels() {
    return [
      { id: 'dinov2_faiss', name: 'DINOv2 Visual Localization', status: 'Ready for Backend API' },
      { id: 'yolo_landmarks', name: 'YOLO Landmark Detector', status: 'Scaffolded in /ai' },
      { id: 'paddle_ocr', name: 'PaddleOCR Room Plate Reader', status: 'Scaffolded in /ai' },
    ];
  },
};
