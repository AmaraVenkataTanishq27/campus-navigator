import React, { useRef, useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Layers,
  ChevronRight,
  ChevronLeft,
  Navigation,
  ArrowRight,
  Target,
  CheckCircle2
} from 'lucide-react';
import { CampusGraph, RouteResult } from '../types/navigation';

interface FloorPlanViewerProps {
  graph: CampusGraph;
  currentFloor: number;
  routeResult: RouteResult | null;
  currentMilestoneIndex: number;
  onFloorChange: (floor: number) => void;
  onSelectMilestone: (index: number) => void;
  onNextMilestone?: () => void;
  onPrevMilestone?: () => void;
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
  onNextMilestone,
  onPrevMilestone,
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

  // Reset to Fit Whole Floor
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

  // Fit active route on screen with ideal framing
  const handleFitToRoute = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;

    const currentFloorNodes = (routeResult?.pathNodeIds || [])
      .map((id) => graph.nodes[id])
      .filter((n) => n && n.floor === currentFloor);

    if (currentFloorNodes.length === 0) {
      handleResetView();
      return;
    }

    const xs = currentFloorNodes.map((n) => n.x);
    const ys = currentFloorNodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const pad = 160;
    const boxW = Math.max(maxX - minX + pad * 2, 320);
    const boxH = Math.max(maxY - minY + pad * 2, 260);

    const fitScale = Math.min(
      Math.max(Math.min(clientWidth / boxW, clientHeight / boxH), 0.45),
      2.5
    );

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    setScale(fitScale);
    setPosition({
      x: clientWidth / 2 - midX * fitScale,
      y: clientHeight / 2 - midY * fitScale
    });
  };

  // Just-in-time transition: ONLY active when current milestone has actually arrived at elevator/stairs
  const activeElevatorTransition = React.useMemo(() => {
    if (!routeResult || !currentMilestone) return null;

    if (currentMilestone.type === 'elevator' || currentMilestone.type === 'stairs') {
      const nextMilestone = routeResult.milestones[currentMilestoneIndex + 1];
      if (nextMilestone) {
        return {
          fromFloor: currentMilestone.floor,
          toFloor: nextMilestone.floor,
          type: currentMilestone.type,
          nodeId: currentMilestone.nodeId
        };
      }
    }
    return null;
  }, [routeResult, currentMilestone, currentMilestoneIndex]);

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
      className="relative flex-1 h-full w-full bg-[#050811] overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Sidebar toggle button */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Collapse sidebar' : 'Open navigation sidebar'}
        className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-[#0B1120] hover:bg-[#1E293B] text-[#00F0FF] border border-[#1E293B] hover:border-[#00F0FF]/50 shadow-lg transition"
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5 stroke-[2.5]" /> : <ChevronRight className="w-5 h-5 stroke-[2.5]" />}
      </button>

      {/* Floating Floor Selector Dock */}
      <div className="absolute top-4 left-16 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-[#0B1120]/95 backdrop-blur-md border border-[#1E293B] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        <span className="text-xs text-slate-300 px-2 font-black flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#00F0FF] stroke-[2.5]" /> Floor:
        </span>
        {availableFloors.map((floor) => {
          const isActive = floor === currentFloor;
          return (
            <button
              key={floor}
              onClick={() => onFloorChange(floor)}
              className={`px-3 py-1.5 text-xs font-black rounded-lg transition-all ${
                isActive
                  ? 'bg-[#00F0FF] text-slate-950 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {floor === 0 ? 'G' : `F${floor}`}
            </button>
          );
        })}
        {routeResult && (
          <span className="text-xs px-2.5 py-1 ml-1 rounded-full bg-cyan-950/80 text-[#00F0FF] font-extrabold border border-cyan-800/80 hidden sm:inline-block shadow-[0_0_8px_rgba(0,240,255,0.25)]">
            Active Route
          </span>
        )}
      </div>

      {/* Compass Rose & North Orientation */}
      <div
        title="North orientation"
        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-xl bg-[#0B1120] border border-[#1E293B] shadow-lg flex flex-col items-center justify-center pointer-events-none select-none"
      >
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[9px] border-b-[#00F0FF] mb-0.5" />
        <span className="text-[10px] font-black text-[#00F0FF] tracking-tighter leading-none">N</span>
        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[9px] border-t-slate-600 mt-0.5" />
      </div>

      {/* Zoom / Viewport Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5 bg-[#0B1120]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#1E293B] shadow-2xl">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 4.0))}
          title="Zoom In"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <ZoomIn className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.25))}
          title="Zoom Out"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <ZoomOut className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset to Fit Whole Floor"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          onClick={handleFitToRoute}
          title="Fit Active Route on Screen"
          className="p-2 rounded-lg hover:bg-cyan-950/50 text-slate-300 hover:text-[#00F0FF] transition"
        >
          <Target className="w-4 h-4 stroke-[2.5]" />
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
            className="p-2 rounded-lg bg-cyan-950/80 text-[#00F0FF] hover:bg-cyan-900 border border-cyan-700 transition shadow-[0_0_10px_rgba(0,240,255,0.3)]"
          >
            <Crosshair className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Floating On-Map Turn-by-Turn Guidance HUD */}
      {routeResult && currentMilestone && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-lg bg-[#0B1120]/95 backdrop-blur-md border border-[#00F0FF]/40 shadow-[0_0_30px_rgba(0,240,255,0.2)] rounded-2xl p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 text-white transition-all">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#3B82F6] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.5)]">
              {currentMilestoneIndex === routeResult.milestones.length - 1 ? (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Navigation className="w-5 h-5 fill-slate-950 stroke-slate-950" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00F0FF] bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/80 shadow-[0_0_6px_rgba(0,240,255,0.2)]">
                  Step {currentMilestoneIndex + 1} of {routeResult.milestones.length}
                </span>
                {currentMilestone.distanceToNextMeters > 0 && (
                  <span className="text-[11px] font-bold text-slate-400">
                    +{currentMilestone.distanceToNextMeters.toFixed(1)}m
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white truncate mt-0.5">
                {currentMilestone.action || currentMilestone.label}
              </div>
              <div className="text-[11px] text-slate-400 font-medium truncate">
                {currentMilestone.subtext}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onPrevMilestone && (
              <button
                onClick={onPrevMilestone}
                disabled={currentMilestoneIndex === 0}
                title="Previous milestone"
                className="p-2 rounded-xl bg-[#070B14] hover:bg-[#1E293B] disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition border border-[#1E293B]"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            {activeElevatorTransition ? (
              <button
                onClick={() => {
                  onFloorChange(activeElevatorTransition.toFloor);
                  if (onNextMilestone) onNextMilestone();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.5)] transition flex items-center gap-1.5 animate-pulse hover:animate-none border border-amber-400"
              >
                <span>Take {activeElevatorTransition.type === 'stairs' ? 'Stairs' : 'Elevator'} to Floor {activeElevatorTransition.toFloor === 0 ? 'G' : `F${activeElevatorTransition.toFloor}`}</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : onNextMilestone && (
              <button
                onClick={onNextMilestone}
                className="px-3.5 py-2 rounded-xl sharp-btn-royal active:scale-95 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1"
              >
                <span>{currentMilestoneIndex === routeResult.milestones.length - 1 ? 'Done' : 'Next'}</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      )}

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
        {/* Floor Plan Background Image (Dark Blueprint Inversion for Cyberpunk) */}
        <img
          src={floorMeta.planImage}
          alt={`Floor Plan ${currentFloor}`}
          style={{
            width: `${imgWidth}px`,
            height: `${imgHeight}px`,
            filter: 'invert(0.92) hue-rotate(190deg) contrast(1.15) brightness(0.92)'
          }}
          className="absolute top-0 left-0 pointer-events-none select-none rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.95)] object-cover bg-[#090D1A]"
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
            {/* Cyberpunk Start Beacon filter */}
            <filter id="beaconGlowCyan" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00F0FF" floodOpacity="0.85" />
            </filter>

            {/* Cyberpunk Destination Beacon filter */}
            <filter id="beaconGlowPink" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FF007F" floodOpacity="0.85" />
            </filter>
          </defs>

          {/* CONTINUOUS CYBERPUNK NEON ROUTE TUBE (Guaranteed visible with CSS drop-shadow) */}
          {currentFloorSvgPaths.map((dPath, idx) => (
            <g key={`neon-path-${idx}`} style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.5))' }}>
              {/* Layer 1: Ambient Magenta/Violet Outer Aura */}
              <path
                d={dPath}
                fill="none"
                stroke="#A855F7"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.55"
              />

              {/* Layer 2: Electric Cyan Solid Neon Core Tube */}
              <path
                d={dPath}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="1"
              />

              {/* Layer 3: Ultra-Luminous Laser Filament Core */}
              <path
                d={dPath}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.9"
              />
            </g>
          ))}

          {/* Fallback line segments */}
          {currentFloorSvgPaths.length === 0 &&
            currentFloorPathSegments.map((seg, idx) => (
              <g key={`fallback-seg-${idx}`} style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.5))' }}>
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke="#A855F7"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.55"
                />
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke="#00F0FF"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="1"
                />
                <line
                  x1={seg.p1.x}
                  y1={seg.p1.y}
                  x2={seg.p2.x}
                  y2={seg.p2.y}
                  stroke="#FFFFFF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.9"
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
              const isTransitionActive = Boolean(isCurrentMilestone && activeElevatorTransition?.nodeId === nodeId);

              let pillText = node.label;
              if (isTransitionActive && activeElevatorTransition) {
                pillText = `Take ${activeElevatorTransition.type === 'stairs' ? 'Stairs' : 'Elevator'} to Floor ${activeElevatorTransition.toFloor === 0 ? 'G' : `F${activeElevatorTransition.toFloor}`} ➔`;
              } else if (isStart) {
                pillText = `Start: ${node.label}`;
              } else if (isDest) {
                pillText = `Destination: ${node.label}`;
              } else if (isFloorChange) {
                pillText = node.type === 'elevator' ? `Elevator` : `Stairs`;
              }

              return (
                <g
                  key={nodeId}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => {
                    if (isTransitionActive && activeElevatorTransition) {
                      onFloorChange(activeElevatorTransition.toFloor);
                      if (onNextMilestone) onNextMilestone();
                      return;
                    }
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
                        stroke={isDest ? '#FF007F' : '#00F0FF'}
                        className="beacon-ring-sharp"
                        filter={isDest ? 'url(#beaconGlowPink)' : 'url(#beaconGlowCyan)'}
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="32"
                        fill="none"
                        stroke={isDest ? '#FF007F' : '#38BDF8'}
                        className="beacon-ring-sharp"
                        filter={isDest ? 'url(#beaconGlowPink)' : 'url(#beaconGlowCyan)'}
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
                      stroke="#FF007F"
                      className="beacon-ring-sharp"
                      filter="url(#beaconGlowPink)"
                      style={{ animationDelay: '1s' }}
                    />
                  )}

                  {/* Node Outer Circle with Soft Glow */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isDest ? 14 : 11}
                    fill={isDest ? '#FF007F' : isStart ? '#00F0FF' : '#0284C7'}
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                    filter={isDest ? 'url(#beaconGlowPink)' : 'url(#beaconGlowCyan)'}
                  />

                  {/* Center Core Dot */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isDest ? 5 : 4}
                    fill="#050811"
                  />

                  {/* Cyberpunk High-Contrast Tag */}
                  <g transform={`translate(${node.x}, ${node.y - 32})`}>
                    <rect
                      x={-((pillText.length * 7.5 + 24) / 2)}
                      y="-14"
                      width={pillText.length * 7.5 + 24}
                      height="26"
                      rx="13"
                      fill={isTransitionActive ? '#B45309' : '#050811'}
                      stroke={isTransitionActive ? '#F59E0B' : isDest ? '#FF007F' : isStart ? '#00F0FF' : '#38BDF8'}
                      strokeWidth={isTransitionActive ? 2.5 : 2}
                      filter="url(#cyberRouteGlow)"
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
