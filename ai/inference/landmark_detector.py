"""
YOLO Landmark Detector
Detects physical corridor objects: doors, door plates, elevator buttons, staircases.
"""
from typing import List, Dict, Any

class YOLOLandmarkDetector:
    CLASSES = ["door", "room_plate", "elevator_call", "stairwell_entrance", "restroom_sign"]

    def __init__(self, weights_path: str = "ai/models/yolov8n_campus.pt"):
        self.weights_path = weights_path
        self._model = None

    def load_model(self):
        try:
            from ultralytics import YOLO
            self._model = YOLO(self.weights_path)
            print(f"[YOLO] Loaded campus model from {self.weights_path}")
        except Exception as e:
            print(f"[YOLO] Light mode notice: using simulated detector ({e})")
            self._model = None

    def detect(self, image_input) -> List[Dict[str, Any]]:
        """
        Returns bounding boxes and class labels for detected landmarks.
        """
        if self._model is not None:
            results = self._model(image_input)
            detections = []
            for r in results:
                for box in r.boxes:
                    detections.append({
                        "label": self.CLASSES[int(box.cls)],
                        "confidence": float(box.conf),
                        "box_normalized": [float(x) for x in box.xyxyn[0]],
                    })
            return detections

        # Demonstration output for room door plate
        return [
            {
                "label": "room_plate",
                "confidence": 0.952,
                "box_normalized": [0.65, 0.22, 0.88, 0.45],
            },
            {
                "label": "door",
                "confidence": 0.981,
                "box_normalized": [0.60, 0.20, 0.92, 0.85],
            },
        ]
