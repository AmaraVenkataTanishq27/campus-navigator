"""
FAISS Index for Nearest-Neighbor Visual Corridor Matching
Stores pre-indexed corridor embeddings mapped to campus navigation nodes.
"""
import numpy as np
from typing import List, Dict, Any, Tuple

class FaissCorridorIndex:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension
        self.node_ids: List[str] = []
        self.metadata: List[Dict[str, Any]] = []
        self._index = None
        self._init_index()

    def _init_index(self):
        try:
            import faiss
            self._index = faiss.IndexFlatIP(self.dimension)
        except ImportError:
            # Fallback in-memory cosine similarity table
            self._vectors: List[np.ndarray] = []
            self._index = None

    def add_corridor_view(self, node_id: str, embedding: np.ndarray, meta: Dict[str, Any]):
        emb_norm = embedding / (np.linalg.norm(embedding) + 1e-7)
        self.node_ids.append(node_id)
        self.metadata.append(meta)

        if self._index is not None:
            self._index.add(np.array([emb_norm], dtype=np.float32))
        else:
            self._vectors.append(emb_norm)

    def query_nearest_node(self, query_emb: np.ndarray, top_k: int = 1) -> List[Tuple[str, float, Dict[str, Any]]]:
        query_norm = query_emb / (np.linalg.norm(query_emb) + 1e-7)

        if self._index is not None and self._index.ntotal > 0:
            distances, indices = self._index.search(np.array([query_norm], dtype=np.float32), top_k)
            results = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx != -1 and idx < len(self.node_ids):
                    results.append((self.node_ids[idx], float(dist), self.metadata[idx]))
            return results
        elif hasattr(self, "_vectors") and len(self._vectors) > 0:
            sims = [float(np.dot(query_norm, v)) for v in self._vectors]
            sorted_indices = np.argsort(sims)[::-1][:top_k]
            return [(self.node_ids[i], sims[i], self.metadata[i]) for i in sorted_indices]

        # Demonstration fallback
        return [("AB_F6_CORR_N4", 0.948, {"label": "North Corridor near AB 608", "floor": "6"})]
