import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Crosshair, Layers, ChevronRight, ChevronLeft } from 'lucide-react';
import { CampusGraph, Milestone, RouteResult } from '../types/navigation';

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
    name: `Floor ${currentFloor}`,
    planImage: `/assets/floor-plans/reference/ab-${currentFloor}th-floor-plan.jpeg`,
    width: 1600,
    height: 1515
  };

  const currentMilestone = routeResult?.milestones[currentMilestoneIndex];

  // Auto-center or fit initial view
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialScale = Math.min(clientWidth / 1600, clientHeight / 1515) * 0.95;
      setScale(initialScale || 0.7);
      setPosition({
        x: (clientWidth - 1600 * initialScale) / 2,
        y: (clientHeight - 1515 * initialScale) / 2
      });
    }
  }, [currentFloor]);

  // Focus view on current milestone when it changes
  useEffect(() => {
    if (currentMilestone && currentMilestone.floor === currentFloor && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const targetX = clientWidth / 2 - currentMilestone.coords.x * scale;
      const targetY = clientHeight / 2 - currentMilestone.coords.y * scale;
      setPosition({ x: targetX, y: targetY });
    }
  }, [currentMilestoneIndex, currentFloor]);

  // Handle Drag / Pan
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
      const fitScale = Math.min(clientWidth / 1600, clientHeight / 1515) * 0.95;
      setScale(fitScale);
      setPosition({
        x: (clientWidth - 1600 * fitScale) / 2,
        y: (clientHeight - 1515 * fitScale) / 2
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

      if (n1.floor === currentFloor && n2.floor === currentFloor) {
        segments.push({
          p1: { x: n1.x, y: n1.y },
          p2: { x: n2.x, y: n2.y },
          isVertical: false
        });
      }
    }
    return segments;
  }, [routeResult, currentFloor, graph]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="relative flex-1 h-full w-full bg-[#0a0e17] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Sidebar toggle button (floating on map) */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Collapse sidebar' : 'Open navigation sidebar'}
        className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 text-gray-200 border border-gray-700/80 shadow-xl backdrop-blur-md transition"
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Floating Floor Tag */}
      <div className="absolute top-4 left-16 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-700/80 shadow-xl backdrop-blur-md">
        <Layers className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-white tracking-wide">{floorMeta.name}</span>
        {routeResult && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
            Active Route
          </span>
        )}
      </div>

      {/* Zoom / Viewport Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-gray-900/90 p-1.5 rounded-xl border border-gray-700/80 shadow-2xl backdrop-blur-md">
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
          width: 1600,
          height: 1515,
          position: 'absolute'
        }}
        className="transition-transform duration-75"
      >
        {/* Floor Plan Background Image */}
        <img
          src={floorMeta.planImage}
          alt={`Floor Plan ${currentFloor}`}
          className="absolute top-0 left-0 w-[1600px] h-[1515px] pointer-events-none select-none rounded-lg shadow-2xl object-cover"
          draggable={false}
          onError={(e) => {
            // Fallback placeholder if image load fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* SVG Route & Milestone Layer */}
        <svg
          viewBox="0 0 1600 1515"
          className="absolute top-0 left-0 w-[1600px] h-[1515px] pointer-events-none"
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
                strokeOpacity="0.4"
                strokeLinecap="round"
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

          {/* Node Markers & Room Badges */}
          {floorNodes.map(([nodeId, node]) => {
            const isRouteNode = routeResult?.pathNodeIds.includes(nodeId);
            const isStart = routeResult?.pathNodeIds[0] === nodeId;
            const isDest = routeResult?.pathNodeIds[routeResult.pathNodeIds.length - 1] === nodeId;
            const isCurrentMilestone = currentMilestone?.nodeId === nodeId;

            // Don't clutter unrouted non-room nodes
            if (!isRouteNode && node.type === 'junction') return null;

            return (
              <g key={nodeId} className="pointer-events-auto cursor-pointer">
                {/* Active pulsating beacon rings for current milestone */}
                {isCurrentMilestone && (
                  <>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill="none"
                      stroke="#06b6d4"
                      className="beacon-ring"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="28"
                      fill="none"
                      stroke="#10b981"
                      className="beacon-ring"
                      style={{ animationDelay: '0.6s' }}
                    />
                  </>
                )}

                {/* Base Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isStart || isDest ? 14 : isRouteNode ? 10 : 7}
                  fill={
                    isDest
                      ? '#06b6d4'
                      : isStart
                      ? '#10b981'
                      : isCurrentMilestone
                      ? '#f59e0b'
                      : isRouteNode
                      ? '#34d399'
                      : '#4b5563'
                  }
                  stroke="#ffffff"
                  strokeWidth={isRouteNode ? 3 : 1.5}
                />

                {/* Node Pill Label */}
                {(isRouteNode || node.type === 'room') && (
                  <g transform={`translate(${node.x}, ${node.y - 18})`}>
                    <rect
                      x={-((node.label.length * 7.5 + 16) / 2)}
                      y="-12"
                      width={node.label.length * 7.5 + 16}
                      height="20"
                      rx="10"
                      fill={isCurrentMilestone ? '#06b6d4' : '#111827'}
                      fillOpacity={isCurrentMilestone ? 0.95 : 0.85}
                      stroke={isCurrentMilestone ? '#38bdf8' : isRouteNode ? '#10b981' : '#374151'}
                      strokeWidth="1.5"
                    />
                    <text
                      textAnchor="middle"
                      y="2"
                      fill={isCurrentMilestone ? '#030712' : '#f9fafb'}
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {node.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
