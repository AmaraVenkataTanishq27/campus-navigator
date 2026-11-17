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
        return <Navigation className="w-4 h-4 text-blue-600 stroke-[2.2]" />;
      case 'grouped_rooms':
        return <ArrowUp className="w-4 h-4 text-blue-600 stroke-[2.2]" />;
      case 'junction':
        return action.toLowerCase().includes('left') ? (
          <CornerUpLeft className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
        ) : (
          <CornerUpRight className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
        );
      case 'stairs':
        return <Footprints className="w-4 h-4 text-slate-700 stroke-[2.2]" />;
      case 'elevator':
        return <ChevronsUpDown className="w-4 h-4 text-slate-700 stroke-[2.2]" />;
      case 'floor_change':
        return <DoorOpen className="w-4 h-4 text-amber-600 stroke-[2.2]" />;
      case 'arrive':
        return <MapPin className="w-4 h-4 text-rose-600 stroke-[2.2]" />;
      default:
        return <Compass className="w-4 h-4 text-blue-600 stroke-[2.2]" />;
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / milestones.length) * 100);

  return (
    <div className="flex flex-col h-full bg-slate-50/60 select-none">
      {/* Route Summary Header */}
      <div className="p-4 bg-white border-b border-slate-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">Route Milestones</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Step {currentIndex + 1} of {milestones.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Progress</span>
            <span className="ml-1.5 text-xs font-black text-blue-600">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden p-[1px]">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
          <div>
            <span className="text-slate-950 font-black">{totalDistance} m</span> total
          </div>
          <span>•</span>
          <div>
            <span className="text-slate-950 font-black">~{estimatedMinutes} min</span> walk
          </div>
          <span>•</span>
          <div>
            Floors: <span className="text-blue-700 font-black">{floorsTraversed.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Milestone List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {milestones.map((ms, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div
              key={ms.id}
              ref={isCurrent ? currentItemRef : null}
              onClick={() => onSelectMilestone(idx)}
              className={`relative rounded-xl p-3.5 border transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-blue-50/80 border-blue-500 border-l-4 shadow-md'
                  : isPassed
                  ? 'bg-slate-100 border-slate-200 text-slate-500 opacity-80 hover:opacity-100'
                  : 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status Indicator Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isPassed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-400">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/40 animate-pulse">
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300 font-bold text-xs">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="p-1 rounded-lg bg-slate-100 border border-slate-200">
                      {renderIcon(ms.type, ms.action)}
                    </span>
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-blue-900 text-sm font-extrabold' : isPassed ? 'text-slate-500 line-through' : 'text-slate-900'
                      }`}
                    >
                      {ms.label}
                    </h4>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed font-semibold">{ms.subtext}</p>

                  {/* Grouped Rooms Badges */}
                  {ms.groupedRooms && ms.groupedRooms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ms.groupedRooms.map((room, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300"
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Distance and Floor Tag */}
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] text-slate-600 font-mono font-bold block">
                    {ms.distanceToNextMeters > 0 ? `+${ms.distanceToNextMeters} m` : 'Arrived'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-black border border-slate-300 mt-1 inline-block">
                    F{ms.floor}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Next Milestone Controls */}
      <div className="sticky bottom-0 p-3 bg-white border-t border-slate-300 flex items-center gap-2 shadow-sm">
        <button
          onClick={onPrevMilestone}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-800 border border-slate-300 transition"
          title="Previous Milestone"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={onNextMilestone}
          disabled={currentIndex >= milestones.length - 1}
          className="flex-1 py-3 px-4 sharp-btn-royal font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-md"
        >
          <span>{currentIndex >= milestones.length - 1 ? 'Destination Reached' : 'Passed / Next Milestone'}</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
