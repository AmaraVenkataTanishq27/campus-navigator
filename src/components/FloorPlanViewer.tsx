import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Crosshair, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { CampusGraph, RouteResult } from '../types/navigation';

interface FloorPlanViewerProps {
  graph: CampusGraph;
  currentFloor: number;
  routeResult: RouteResult | null;
  currentMilestoneIndex: number;
  onFloorChange: (floor: number) => void;
  onSelectMilestone: (index: number) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({
  graph,
  currentFloor,
  routeResult,
  currentMilestoneIndex,
  onFloorChange,
  onSelectMilestone,
  sidebarOpen,
  onToggleSidebar
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const floorMeta = graph.floors[String(currentFloor)] || {
    name: currentFloor === 0 ? 'Apex Block - Ground Floor' : `Apex Block - Floor ${currentFloor}`,
    planImage: `/assets/floor-plans/reference/apex-${currentFloor}th-floor.png`,
    width: (currentFloor === 0 || currentFloor === 1 || currentFloor === 6) ? 1587 : 1600,
    height: (currentFloor === 0 || currentFloor === 1 || currentFloor === 6) ? 2244 : 1515
  };

  const imgWidth = floorMeta.width || 1600;
  const imgHeight = floorMeta.height || 1515;

  const currentMilestone = routeResult?.milestones[currentMilestoneIndex];
  const availableFloors = Object.keys(graph.floors).map(Number).sort((a, b) => a - b);

  // Auto-center or fit initial view
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialScale = Math.min(clientWidth / imgWidth, clientHeight / imgHeight) * 0.95;
      setScale(initialScale || 0.7);
      setPosition({
        x: (clientWidth - imgWidth * initialScale) / 2,
        y: (clientHeight - imgHeight * initialScale) / 2
      });
    }
  }, [currentFloor, imgWidth, imgHeight]);

  // Focus view on current milestone when it changes
  useEffect(() => {
    if (currentMilestone && currentMilestone.floor === currentFloor && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const targetX = clientWidth / 2 - currentMilestone.coords.x * scale;
      const targetY = clientHeight / 2 - currentMilestone.coords.y * scale;
      setPosition({ x: targetX, y: targetY });
    }
  }, [currentMilestoneIndex, currentFloor, routeResult]);

  // Handle Drag / Pan (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Dual-touch state for pinch zoom
  const [touchDistance, setTouchDistance] = useState<number | null>(null);

  const getTouchDistance = (e: React.TouchEvent) => {
    if (e.touches.length < 2) return null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle Drag / Pan & Pinch Zoom (Touch for mobile / tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
      setTouchDistance(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      setTouchDistance(getTouchDistance(e));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    } else if (e.touches.length === 2) {
      const newDist = getTouchDistance(e);
      if (newDist && touchDistance && touchDistance > 0 && containerRef.current) {
        const factor = newDist / touchDistance;
        const newScale = Math.min(Math.max(scale * factor, 0.25), 4.0);
        const rect = containerRef.current.getBoundingClientRect();
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

        const newX = midX - ((midX - position.x) * newScale) / scale;
        const newY = midY - ((midY - position.y) * newScale) / scale;

        setScale(newScale);
        setPosition({ x: newX, y: newY });
        setTouchDistance(newDist);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchDistance(null);
  };

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.25), 4.0);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - ((mouseX - position.x) * newScale) / scale;
      const newY = mouseY - ((mouseY - position.y) * newScale) / scale;

      setScale(newScale);
      setPosition({ x: newX, y: newY });
    }
  };

  // Center / Reset View
  const handleResetView = () => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const fitScale = Math.min(clientWidth / imgWidth, clientHeight / imgHeight) * 0.95;
      setScale(fitScale);
      setPosition({
        x: (clientWidth - imgWidth * fitScale) / 2,
        y: (clientHeight - imgHeight * fitScale) / 2
      });
    }
  };

  // Filter path nodes on current floor
  const floorNodes = Object.entries(graph.nodes).filter(([_, node]) => node.floor === currentFloor);

  // Build SVG path segments for the current floor
  const currentFloorPathSegments = React.useMemo(() => {
    if (!routeResult || routeResult.pathNodeIds.length < 2) return [];

    const segments: { p1: { x: number; y: number }; p2: { x: number; y: number }; isVertical: boolean }[] = [];
    const ids = routeResult.pathNodeIds;

    for (let i = 0; i < ids.length - 1; i++) {
      const n1 = graph.nodes[ids[i]];
      const n2 = graph.nodes[ids[i + 1]];

      if (n1 && n2 && n1.floor === currentFloor && n2.floor === currentFloor) {
        segments.push({
          p1: { x: n1.x, y: n1.y },
          p2: { x: n2.x, y: n2.y },
          isVertical: false
        });
      }
    }
    return segments;
  }, [routeResult, currentFloor, graph]);

  // Hide extra intermediate nodes and only show:
  // 1. Start room (on its floor)
  // 2. Floor transition departure (where leaving current floor)
  // 3. Floor transition arrival (where entering current floor)
  // 4. Destination room (on its floor)
  const visibleKeyNodeIds = React.useMemo(() => {
    if (!routeResult || routeResult.pathNodeIds.length === 0) {
      return new Set<string>();
    }

    const keyIds = new Set<string>();
    const path = routeResult.pathNodeIds;
    const startId = path[0];
    const destId = path[path.length - 1];

    if (graph.nodes[startId]?.floor === currentFloor) {
      keyIds.add(startId);
    }
    if (graph.nodes[destId]?.floor === currentFloor) {
      keyIds.add(destId);
    }

    for (let i = 0; i < path.length - 1; i++) {
      const u = graph.nodes[path[i]];
      const v = graph.nodes[path[i + 1]];
      if (u && v && u.floor !== v.floor) {
        if (u.floor === currentFloor) {
          keyIds.add(path[i]);
        }
        if (v.floor === currentFloor) {
          keyIds.add(path[i + 1]);
        }
      }
    }

    return keyIds;
  }, [routeResult, currentFloor, graph]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      className="relative flex-1 h-full w-full bg-[#0a0e17] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Sidebar toggle button (floating on map) */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Collapse sidebar' : 'Open navigation sidebar'}
        className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-[#0d121f]/90 hover:bg-gray-800 text-gray-200 border border-gray-700/80 shadow-xl backdrop-blur-md transition"
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Floating Floor Selector Tabs */}
      <div className="absolute top-4 left-16 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-[#0d121f]/90 border border-gray-700/80 shadow-xl backdrop-blur-md">
        <span className="text-xs text-gray-400 px-2 font-medium flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" /> Floor:
        </span>
        {availableFloors.map((floor) => {
          const isActive = floor === currentFloor;
          return (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-md shadow-emerald-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {floor === 0 ? 'G' : `F${floor}`}
            </button>
          );
        })}
        {routeResult && (
          <span className="text-[10px] px-2 py-0.5 ml-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 hidden sm:inline-block">
            Active Route
          </span>
        )}
      </div>

      {/* Zoom / Viewport Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-[#0d121f]/90 p-1.5 rounded-xl border border-gray-700/80 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 4.0))}
          title="Zoom In"
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.25))}
          title="Zoom Out"
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset to Fit"
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        {currentMilestone && currentMilestone.floor === currentFloor && (
          <button
            onClick={() => {
              if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                setPosition({
                  x: clientWidth / 2 - currentMilestone.coords.x * scale,
                  y: clientHeight / 2 - currentMilestone.coords.y * scale
                });
              }
            }}
            title="Focus Current Milestone"
            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Map Pan & Zoom Container */}
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: imgWidth,
          height: imgHeight,
          position: 'absolute'
        }}
        className="transition-transform duration-75"
      >
        {/* Floor Plan Background Image */}
        <img
          src={floorMeta.planImage}
          alt={`Floor Plan ${currentFloor}`}
          style={{ width: `${imgWidth}px`, height: `${imgHeight}px` }}
          className="absolute top-0 left-0 pointer-events-none select-none rounded-lg shadow-2xl object-cover"
          draggable={false}
          onError={(e) => {
            // Fallback placeholder if image load fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* SVG Route & Milestone Layer */}
        <svg
          viewBox={`0 0 ${imgWidth} ${imgHeight}`}
          style={{ width: `${imgWidth}px`, height: `${imgHeight}px` }}
          className="absolute top-0 left-0 pointer-events-none"
        >
          <defs>
            {/* Glowing filter for active path */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
            <filter id="beaconGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#06b6d4" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Drawn Polyline Segments */}
          {currentFloorPathSegments.map((seg, idx) => (
            <g key={`path-${idx}`}>
              {/* Outer path glow */}
              <line
                x1={seg.p1.x}
                y1={seg.p1.y}
                x2={seg.p2.x}
                y2={seg.p2.y}
                stroke="#10b981"
                strokeWidth="12"
                strokeOpacity="0.5"
                strokeLinecap="round"
                filter="url(#routeGlow)"
              />
              {/* Core animated dashed path */}
              <line
                x1={seg.p1.x}
                y1={seg.p1.y}
                x2={seg.p2.x}
                y2={seg.p2.y}
                stroke="#34d399"
                strokeWidth="5"
                strokeLinecap="round"
                className="route-poly-dash"
              />
            </g>
          ))}

          {/* Node Markers & Room Badges (Only Key Milestones: Start, Floor Transition, Destination) */}
          {floorNodes
            .filter(([nodeId]) => visibleKeyNodeIds.has(nodeId))
            .map(([nodeId, node]) => {
              const isStart = routeResult?.pathNodeIds[0] === nodeId;
              const isDest = routeResult?.pathNodeIds[routeResult.pathNodeIds.length - 1] === nodeId;
              const isCurrentMilestone = currentMilestone?.nodeId === nodeId;
              const isFloorChange = !isStart && !isDest;

              let pillText = node.label;
              if (isStart) pillText = `Start: ${node.label}`;
              else if (isDest) pillText = `Destination: ${node.label}`;
              else if (isFloorChange) {
                pillText = node.type === 'elevator' ? `Elevator Transfer` : `Stairs Transfer`;
              }

              return (
                <g
                  key={nodeId}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => {
                    if (routeResult) {
                      const msIdx = routeResult.milestones.findIndex((m) => m.nodeId === nodeId);
                      if (msIdx !== -1) {
                        onSelectMilestone(msIdx);
                      }
                    }
                  }}
                >
                  {/* Active pulsating beacon rings for current milestone */}
                  {isCurrentMilestone && (
                    <>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill="none"
                        stroke="#06b6d4"
                        className="beacon-ring"
                        filter="url(#beaconGlow)"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="32"
                        fill="none"
                        stroke="#10b981"
                        className="beacon-ring"
                        filter="url(#beaconGlow)"
                        style={{ animationDelay: '0.6s' }}
                      />
                    </>
                  )}

                  {/* Base Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isDest ? 16 : 13}
                    fill={
                      isDest
                        ? '#06b6d4'
                        : isStart
                        ? '#10b981'
                        : isCurrentMilestone
                        ? '#f59e0b'
                        : '#38bdf8'
                    }
                    stroke="#ffffff"
                    strokeWidth={3}
                  />

                  {/* Node Pill Label */}
                  <g transform={`translate(${node.x}, ${node.y - 22})`}>
                    <rect
                      x={-((pillText.length * 7.5 + 20) / 2)}
                      y="-13"
                      width={pillText.length * 7.5 + 20}
                      height="24"
                      rx="12"
                      fill={isCurrentMilestone ? '#06b6d4' : isStart ? '#064e3b' : isDest ? '#083344' : '#1e293b'}
                      fillOpacity={0.95}
                      stroke={isCurrentMilestone ? '#38bdf8' : isStart ? '#10b981' : isDest ? '#06b6d4' : '#64748b'}
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      y="3"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {pillText}
                    </text>
                  </g>
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );
};
