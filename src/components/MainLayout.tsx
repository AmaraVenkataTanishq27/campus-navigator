import React from 'react';
import { RouteSelector } from './RouteSelector';
import { MilestoneStepper } from './MilestoneStepper';
import { FloorPlanViewer } from './FloorPlanViewer';
import { CampusGraph, RouteResult } from '../types/navigation';

interface MainLayoutProps {
  graph: CampusGraph;
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  selectedStartId: string | null;
  selectedEndId: string | null;
  onSelectStart: (id: string | null) => void;
  onSelectEnd: (id: string | null) => void;
  onCalculateRoute: (startId?: string, endId?: string) => void;
  onClearRoute: () => void;
  routeResult: RouteResult | null;
  currentMilestoneIndex: number;
  onSelectMilestone: (index: number) => void;
  onNextMilestone: () => void;
  onPrevMilestone: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  theme?: 'cyberpunk' | 'beige';
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  graph,
  currentFloor,
  onFloorChange,
  selectedStartId,
  selectedEndId,
  onSelectStart,
  onSelectEnd,
  onCalculateRoute,
  onClearRoute,
  routeResult,
  currentMilestoneIndex,
  onSelectMilestone,
  onNextMilestone,
  onPrevMilestone,
  sidebarOpen,
  onToggleSidebar,
  theme = 'cyberpunk'
}) => {
  const isCyber = theme === 'cyberpunk';

  return (
    <div className={`flex-1 flex overflow-hidden relative transition-colors duration-300 ${isCyber ? 'bg-[#050811]' : 'bg-[#F6F3ED]'}`}>
      {/* Left Sidebar (Desktop slide-over + Mobile responsive drawer) */}
      <aside
        className={`w-full md:w-[420px] flex-shrink-0 border-r flex flex-col z-20 transition-all duration-300 ease-in-out ${
          isCyber
            ? 'bg-[#0B1120] border-[#1E293B] shadow-[0_0_30px_rgba(0,0,0,0.8)]'
            : 'bg-white border-slate-300 shadow-lg'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[420px]'}`}
      >
        {/* Mobile Pull Handle */}
        <div className="md:hidden flex justify-center py-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-500/40" />
        </div>

        {/* Route Selector */}
        <RouteSelector
          graph={graph}
          selectedStartId={selectedStartId}
          selectedEndId={selectedEndId}
          onSelectStart={onSelectStart}
          onSelectEnd={onSelectEnd}
          onCalculateRoute={onCalculateRoute}
          onClearRoute={onClearRoute}
          theme={theme}
        />

        {/* Milestone Stepper or Empty Prompt */}
        <div className={`flex-1 overflow-hidden ${isCyber ? 'bg-[#070B14]' : 'bg-[#FAF8F5]'}`}>
          {routeResult ? (
            <MilestoneStepper
              routeResult={routeResult}
              currentIndex={currentMilestoneIndex}
              onSelectMilestone={onSelectMilestone}
              onNextMilestone={onNextMilestone}
              onPrevMilestone={onPrevMilestone}
              theme={theme}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm border ${
                isCyber
                  ? 'bg-cyan-950/50 border-cyan-500/40 text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.25)]'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h4 className={`text-base font-extrabold mb-1 tracking-tight ${isCyber ? 'text-white' : 'text-slate-900'}`}>Indoor Landmark Guidance</h4>
              <p className={`text-xs max-w-xs leading-relaxed font-medium ${isCyber ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
                Select your starting room and destination room above to calculate an indoor route across Apex Block.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Map Viewport */}
      <main className="flex-1 relative h-full overflow-hidden">
        <FloorPlanViewer
          graph={graph}
          currentFloor={currentFloor}
          routeResult={routeResult}
          currentMilestoneIndex={currentMilestoneIndex}
          onFloorChange={onFloorChange}
          onSelectMilestone={onSelectMilestone}
          onNextMilestone={onNextMilestone}
          onPrevMilestone={onPrevMilestone}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={onToggleSidebar}
          theme={theme}
          onSelectStart={onSelectStart}
          onSelectEnd={onSelectEnd}
          onCalculateRoute={onCalculateRoute}
          selectedStartId={selectedStartId}
          selectedEndId={selectedEndId}
        />
      </main>
    </div>
  );
};
