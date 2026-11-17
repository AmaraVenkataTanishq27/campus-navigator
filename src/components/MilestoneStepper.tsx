import React, { useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Navigation,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight,
  Footprints,
  ChevronsUpDown,
  DoorOpen,
  MapPin,
  Compass,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Milestone, RouteResult } from '../types/navigation';

interface MilestoneStepperProps {
  routeResult: RouteResult;
  currentIndex: number;
  onSelectMilestone: (index: number) => void;
  onNextMilestone: () => void;
  onPrevMilestone: () => void;
}

export const MilestoneStepper: React.FC<MilestoneStepperProps> = ({
  routeResult,
  currentIndex,
  onSelectMilestone,
  onNextMilestone,
  onPrevMilestone
}) => {
  const currentItemRef = useRef<HTMLDivElement>(null);
  const { milestones, totalDistance, estimatedMinutes, floorsTraversed } = routeResult;

  // Auto-scroll the active milestone card into view
  useEffect(() => {
    if (currentItemRef.current) {
      currentItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentIndex]);

  const renderIcon = (type: string, action: string) => {
    switch (type) {
      case 'start':
        return <Navigation className="w-4 h-4 text-emerald-400" />;
      case 'grouped_rooms':
        return <ArrowUp className="w-4 h-4 text-emerald-400" />;
      case 'junction':
        return action.toLowerCase().includes('left') ? (
          <CornerUpLeft className="w-4 h-4 text-amber-400" />
        ) : (
          <CornerUpRight className="w-4 h-4 text-amber-400" />
        );
      case 'stairs':
        return <Footprints className="w-4 h-4 text-cyan-400" />;
      case 'elevator':
        return <ChevronsUpDown className="w-4 h-4 text-cyan-400" />;
      case 'floor_change':
        return <DoorOpen className="w-4 h-4 text-indigo-400" />;
      case 'arrive':
        return <MapPin className="w-4 h-4 text-rose-400" />;
      default:
        return <Compass className="w-4 h-4 text-emerald-400" />;
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / milestones.length) * 100);

  return (
    <div className="flex flex-col h-full bg-[#0d121f] select-none">
      {/* Route Summary Header */}
      <div className="p-4 bg-[#0d121f]/95 border-b border-gray-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white">Milestone Checklist</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Step {currentIndex + 1} of {milestones.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Progress</span>
            <span className="ml-1.5 text-xs font-bold text-emerald-400">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#131b2e] rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div>
            <span className="text-white font-semibold">{totalDistance} m</span> total
          </div>
          <span>•</span>
          <div>
            <span className="text-white font-semibold">~{estimatedMinutes} min</span> walk
          </div>
          <span>•</span>
          <div>
            Floors: <span className="text-emerald-400 font-semibold">{floorsTraversed.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Milestone List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {milestones.map((ms, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div
              key={ms.id}
              ref={isCurrent ? currentItemRef : null}
              onClick={() => onSelectMilestone(idx)}
              className={`relative rounded-xl p-3 border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/30'
                  : isPassed
                  ? 'bg-[#131b2e]/40 border-gray-800 text-gray-500 opacity-80 hover:opacity-100'
                  : 'bg-[#131b2e]/80 border-gray-700/60 text-gray-300 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status Indicator Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isPassed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-gray-950 flex items-center justify-center font-bold text-xs shadow-md shadow-emerald-500/40 animate-pulse">
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-gray-700">
                      <Circle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="p-1 rounded bg-gray-800/80 border border-gray-700">
                      {renderIcon(ms.type, ms.action)}
                    </span>
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-emerald-300 text-sm' : isPassed ? 'text-gray-400 line-through' : 'text-gray-200'
                      }`}
                    >
                      {ms.label}
                    </h4>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{ms.subtext}</p>

                  {/* Grouped Rooms Badges */}
                  {ms.groupedRooms && ms.groupedRooms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ms.groupedRooms.map((room, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1a2337] text-cyan-300 border border-cyan-500/30"
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Distance and Floor Tag */}
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {ms.distanceToNextMeters > 0 ? `+${ms.distanceToNextMeters} m` : 'Arrived'}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-medium border border-gray-700 mt-1 inline-block">
                    F{ms.floor}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Next Milestone Controls */}
      <div className="sticky bottom-0 p-3 bg-[#0d121f]/95 backdrop-blur-md border-t border-gray-800/80 flex items-center gap-2">
        <button
          onClick={onPrevMilestone}
          disabled={currentIndex === 0}
          className="p-2.5 rounded-xl bg-[#131b2e] hover:bg-[#1a2337] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 hover:text-white border border-gray-700/80 transition"
          title="Previous Milestone"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={onNextMilestone}
          disabled={currentIndex >= milestones.length - 1}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-gray-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
        >
          <span>{currentIndex >= milestones.length - 1 ? 'Destination Reached' : 'Passed / Next Milestone'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
