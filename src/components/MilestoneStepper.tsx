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
  theme?: 'cyberpunk' | 'beige';
}

export const MilestoneStepper: React.FC<MilestoneStepperProps> = ({
  routeResult,
  currentIndex,
  onSelectMilestone,
  onNextMilestone,
  onPrevMilestone,
  theme = 'cyberpunk'
}) => {
  const isCyber = theme === 'cyberpunk';
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
        return <Navigation className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#00F0FF]' : 'text-blue-600'}`} />;
      case 'grouped_rooms':
        return <ArrowUp className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#00F0FF]' : 'text-blue-600'}`} />;
      case 'junction':
        return action.toLowerCase().includes('left') ? (
          <CornerUpLeft className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#FF007F]' : 'text-indigo-600'}`} />
        ) : (
          <CornerUpRight className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#FF007F]' : 'text-indigo-600'}`} />
        );
      case 'stairs':
        return <Footprints className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-amber-400' : 'text-stone-700'}`} />;
      case 'elevator':
        return <ChevronsUpDown className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-amber-400' : 'text-stone-700'}`} />;
      case 'floor_change':
        return <DoorOpen className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-purple-400' : 'text-amber-600'}`} />;
      case 'arrive':
        return <MapPin className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#FF007F]' : 'text-rose-600'}`} />;
      default:
        return <Compass className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#00F0FF]' : 'text-blue-600'}`} />;
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / milestones.length) * 100);

  return (
    <div className={`flex flex-col h-full select-none transition-colors duration-200 ${
      isCyber ? 'bg-[#070B14]' : 'bg-[#FAF8F5]'
    }`}>
      {/* Route Summary Header */}
      <div className={`p-4 border-b ${
        isCyber ? 'bg-[#0B1120] border-[#1E293B]' : 'bg-[#FAF8F5] border-[#E7E2DA]'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`font-extrabold text-sm ${isCyber ? 'text-white' : 'text-stone-900'}`}>
              Route Milestones
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              isCyber
                ? 'bg-cyan-950/80 text-[#00F0FF] border-cyan-800/80 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              Step {currentIndex + 1} of {milestones.length}
            </span>
          </div>
          <div className="text-right">
            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isCyber ? 'text-slate-400' : 'text-stone-500'}`}>Progress</span>
            <span className={`ml-1.5 text-xs font-black ${isCyber ? 'text-[#00F0FF]' : 'text-blue-700'}`}>{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full rounded-full h-2 mb-3 overflow-hidden p-[1px] border ${
          isCyber ? 'bg-[#070B14] border-[#1E293B]' : 'bg-[#E7E2DA] border-[#D6CFC4]'
        }`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCyber
                ? 'bg-gradient-to-r from-[#00F0FF] via-[#06B6D4] to-[#A855F7] shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'bg-gradient-to-r from-[#1E40AF] to-[#2563EB]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Metric Badges */}
        <div className={`flex items-center gap-3 text-xs font-bold ${isCyber ? 'text-slate-400' : 'text-stone-500'}`}>
          <div>
            <span className={`font-black ${isCyber ? 'text-white' : 'text-stone-900'}`}>{totalDistance} m</span> total
          </div>
          <span>•</span>
          <div>
            <span className={`font-black ${isCyber ? 'text-white' : 'text-stone-900'}`}>~{estimatedMinutes} min</span> walk
          </div>
          <span>•</span>
          <div>
            Floors: <span className={`font-black ${isCyber ? 'text-[#00F0FF]' : 'text-blue-700'}`}>{floorsTraversed.join(', ')}</span>
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
                  ? isCyber
                    ? 'bg-cyan-950/30 border-[#00F0FF] border-l-4 shadow-[0_0_18px_rgba(0,240,255,0.25)]'
                    : 'bg-blue-50/80 border-blue-600 border-l-4 shadow-md shadow-blue-500/10'
                  : isPassed
                  ? isCyber
                    ? 'bg-[#0B1120]/40 border-[#1E293B] text-slate-500 opacity-60 hover:opacity-90'
                    : 'bg-[#F2EEE9]/60 border-[#E7E2DA] text-stone-400 opacity-60 hover:opacity-90'
                  : isCyber
                  ? 'bg-[#0B1120] border-[#1E293B] text-slate-200 shadow-sm hover:border-[#00F0FF]/40'
                  : 'bg-white border-[#E7E2DA] text-stone-800 shadow-sm hover:border-blue-400'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status Indicator Icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {isPassed ? (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isCyber
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  ) : isCurrent ? (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs animate-pulse ${
                      isCyber
                        ? 'bg-[#00F0FF] text-slate-950 shadow-[0_0_10px_#00F0FF]'
                        : 'bg-[#1E40AF] text-white shadow-md shadow-blue-500/30'
                    }`}>
                      {idx + 1}
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                      isCyber
                        ? 'bg-[#070B14] text-slate-400 border-[#1E293B]'
                        : 'bg-[#F2EEE9] text-stone-500 border-[#E7E2DA]'
                    }`}>
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`p-1 rounded-lg border ${
                      isCyber ? 'bg-[#070B14] border-[#1E293B]' : 'bg-[#F2EEE9] border-[#E2DDD5]'
                    }`}>
                      {renderIcon(ms.type, ms.action)}
                    </span>
                    <h4
                      className={`text-xs font-bold truncate ${
                        isCurrent
                          ? isCyber ? 'text-[#00F0FF] text-sm font-extrabold' : 'text-blue-900 text-sm font-extrabold'
                          : isPassed
                          ? isCyber ? 'text-slate-500 line-through' : 'text-stone-400 line-through'
                          : isCyber ? 'text-slate-200' : 'text-stone-800'
                      }`}
                    >
                      {ms.label}
                    </h4>
                  </div>

                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed font-medium ${
                    isCyber ? 'text-slate-400' : 'text-stone-600'
                  }`}>{ms.subtext}</p>

                  {/* Grouped Rooms Badges */}
                  {ms.groupedRooms && ms.groupedRooms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ms.groupedRooms.map((room, rIdx) => (
                        <span
                          key={rIdx}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            isCyber
                              ? 'bg-[#070B14] text-slate-300 border-[#1E293B]'
                              : 'bg-[#F2EEE9] text-stone-700 border-[#E2DDD5]'
                          }`}
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Distance and Floor Tag */}
                <div className="text-right flex-shrink-0">
                  <span className={`text-[11px] font-mono font-bold block ${
                    isCyber ? 'text-slate-400' : 'text-stone-500'
                  }`}>
                    {ms.distanceToNextMeters > 0 ? `+${ms.distanceToNextMeters} m` : 'Arrived'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-black border mt-1 inline-block ${
                    isCyber
                      ? 'bg-[#070B14] text-slate-300 border-[#1E293B]'
                      : 'bg-[#F2EEE9] text-stone-700 border-[#E2DDD5]'
                  }`}>
                    F{ms.floor}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Next Milestone Controls */}
      <div className={`sticky bottom-0 p-3 border-t flex items-center gap-2 shadow-lg ${
        isCyber ? 'bg-[#0B1120] border-[#1E293B]' : 'bg-[#FAF8F5] border-[#E7E2DA]'
      }`}>
        <button
          onClick={onPrevMilestone}
          disabled={currentIndex === 0}
          className={`p-3 rounded-xl border transition disabled:opacity-30 disabled:cursor-not-allowed ${
            isCyber
              ? 'bg-[#070B14] hover:bg-[#0F172A] text-slate-300 border-[#1E293B]'
              : 'bg-[#F2EEE9] hover:bg-[#EBE6DF] text-stone-700 border-[#E2DDD5]'
          }`}
          title="Previous Milestone"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={onNextMilestone}
          disabled={currentIndex >= milestones.length - 1}
          className={`flex-1 py-3 px-4 font-black text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg transition-transform active:scale-[0.98] ${
            isCyber
              ? 'sharp-btn-royal text-slate-950'
              : 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-blue-900/20'
          }`}
        >
          <span>{currentIndex >= milestones.length - 1 ? 'Destination Reached' : 'Passed / Next Milestone'}</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
