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

  // Handle Touch
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

  // Reset to Fit
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

  const floorNodes = Object.entries(graph.nodes).filter(([_, node]) => node.floor === currentFloor);

  // Build continuous SVG path data strings (M x y L x y ...) for the current floor
  const currentFloorSvgPaths = React.useMemo(() => {
    if (!routeResult || routeResult.pathNodeIds.length < 2) return [];

    const paths: string[] = [];
    let currentSegment: { x: number; y: number }[] = [];

    for (let i = 0; i < routeResult.pathNodeIds.length; i++) {
      const node = graph.nodes[routeResult.pathNodeIds[i]];
      if (node && node.floor === currentFloor) {
        currentSegment.push({ x: node.x, y: node.y });
      } else {
        if (currentSegment.length >= 2) {
          paths.push('M ' + currentSegment.map((p) => `${p.x} ${p.y}`).join(' L '));
        }
        currentSegment = [];
      }
    }

    if (currentSegment.length >= 2) {
      paths.push('M ' + currentSegment.map((p) => `${p.x} ${p.y}`).join(' L '));
    }

    return paths;
  }, [routeResult, currentFloor, graph]);

  // Fallback pairwise segments
  const currentFloorPathSegments = React.useMemo(() => {
    if (!routeResult || routeResult.pathNodeIds.length < 2) return [];

    const segments: { p1: { x: number; y: number }; p2: { x: number; y: number } }[] = [];
    const ids = routeResult.pathNodeIds;

    for (let i = 0; i < ids.length - 1; i++) {
      const n1 = graph.nodes[ids[i]];
      const n2 = graph.nodes[ids[i + 1]];

      if (n1 && n2 && n1.floor === currentFloor && n2.floor === currentFloor) {
        segments.push({
          p1: { x: n1.x, y: n1.y },
          p2: { x: n2.x, y: n2.y }
        });
      }
    }
    return segments;
  }, [routeResult, currentFloor, graph]);

  // Key Milestones visible: Start, Floor Transition Departure/Arrival, Destination
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
      className="relative flex-1 h-full w-full bg-[#EAE5DC] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Sidebar toggle button */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Collapse sidebar' : 'Open navigation sidebar'}
        className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 shadow-md transition"
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5 stroke-[2.5]" /> : <ChevronRight className="w-5 h-5 stroke-[2.5]" />}
      </button>

      {/* Floating Floor Selector Dock */}
      <div className="absolute top-4 left-16 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-white border border-slate-300 shadow-md">
        <span className="text-xs text-slate-800 px-2 font-black flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600 stroke-[2.5]" /> Floor:
        </span>
        {availableFloors.map((floor) => {
          const isActive = floor === currentFloor;
          return (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-800 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              {floor === 0 ? 'G' : `F${floor}`}
            </button>
          );
        })}
        {routeResult && (
          <span className="text-xs px-2.5 py-1 ml-1 rounded-full bg-blue-100 text-blue-800 font-extrabold border border-blue-300 hidden sm:inline-block">
            Active Route
          </span>
        )}
      </div>

      {/* Zoom / Viewport Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-white p-1.5 rounded-xl border border-slate-300 shadow-xl">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 4.0))}
          title="Zoom In"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-800 hover:text-slate-950 transition"
        >
          <ZoomIn className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.25))}
          title="Zoom Out"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-800 hover:text-slate-950 transition"
        >
          <ZoomOut className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset to Fit"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-800 hover:text-slate-950 transition"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
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
            className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 transition shadow-sm"
          >
            <Crosshair className="w-4 h-4 stroke-[2.5]" />
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
          className="absolute top-0 left-0 pointer-events-none select-none rounded-xl shadow-2xl object-cover bg-white"
          draggable={false}
          onError={(e) => {
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
            {/* Balanced Ambient Glow Filter (Middle brightness: comfortable, luminous, no harsh glare) */}
            <filter id="balancedRouteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#3B82F6" floodOpacity="0.4" />
            </filter>

            {/* Start Beacon filter */}
            <filter id="beaconGlowSharp" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#2563EB" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* CONTINUOUS NEON ROUTE TUBE (Middle brightness: 4.8px rich royal cobalt body, soft luminous aura, no white-hot burnout, no dark rails) */}
          {currentFloorSvgPaths.map((dPath, idx) => (
            <g key={`neon-path-${idx}`}>
              {/* Layer 1: Ambient Colored Glow Aura (Soft, diffused cobalt glow) */}
              <path
                d={dPath}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.28"
                filter="url(#balancedRouteGlow)"
              />

              {/* Layer 2: Core Rich Royal Blue Path (Balanced middle tone, vivid and crisp) */}
              <path
                d={dPath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="4.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.95"
              />

              {/* Layer 3: Soft Luminous Core Highlight (Gentle sky-blue, not blinding white) */}
              <path
                d={dPath}
                fill="none"
                stroke="#93C5FD"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.6"
              />
            </g>
          ))}

          {/* Fallback line segments */}
          {currentFloorSvgPaths.length === 0 &&
            currentFloorPathSegments.map((seg, idx) => (
              <g key={`fallback-seg-${idx}`}>
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke="#3B82F6"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.28"
                  filter="url(#balancedRouteGlow)"
                />
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke="#2563EB"
                  strokeWidth="4.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.95"
                />
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke="#93C5FD"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.6"
                />
              </g>
            ))}

          {/* Key Milestone Nodes: Start, Floor Transition Departure/Arrival, Destination */}
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
                  {/* Concentric pulsing beacon rings for active/start */}
                  {(isCurrentMilestone || isStart) && (
                    <>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="18"
                        fill="none"
                        stroke={isDest ? '#EF4444' : '#2563EB'}
                        className="beacon-ring-sharp"
                        filter="url(#beaconGlowSharp)"
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="32"
                        fill="none"
                        stroke={isDest ? '#F97316' : '#60A5FA'}
                        className="beacon-ring-sharp"
                        filter="url(#beaconGlowSharp)"
                        style={{ animationDelay: '0.6s' }}
                      />
                    </>
                  )}

                  {/* Destination pulsing radar ring */}
                  {isDest && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="44"
                      fill="none"
                      stroke="#EF4444"
                      className="beacon-ring-sharp"
                      style={{ animationDelay: '1s' }}
                    />
                  )}

                  {/* Node Outer Circle with Soft Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isDest ? 14 : 11}
                    fill={isDest ? '#DC2626' : isStart ? '#2563EB' : '#1D4ED8'}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    filter="url(#balancedRouteGlow)"
                  />

                  {/* Center Core Dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isDest ? 5 : 4}
                    fill="#FFFFFF"
                  />

                  {/* High-Contrast Bold Label Tag (Elevated above circle to prevent overlapping) */}
                  <g transform={`translate(${node.x}, ${node.y - 32})`}>
                    <rect
                      x={-((pillText.length * 8 + 24) / 2)}
                      y="-14"
                      width={pillText.length * 8 + 24}
                      height="26"
                      rx="13"
                      fill="#0F172A"
                      stroke={isDest ? '#EF4444' : isStart ? '#38BDF8' : '#60A5FA'}
                      strokeWidth="2"
                      filter="url(#balancedRouteGlow)"
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fill="#FFFFFF"
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
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
