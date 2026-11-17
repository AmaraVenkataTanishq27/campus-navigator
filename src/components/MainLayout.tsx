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
  onToggleSidebar
}) => {
  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Left Sidebar (~420px) */}
      <aside
        className={`w-full md:w-[420px] flex-shrink-0 bg-[#0d121f] border-r border-gray-800/80 flex flex-col z-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[420px]'
        }`}
      >
        {/* Route Selector (Start & Destination Room Search) */}
        <RouteSelector
          graph={graph}
          selectedStartId={selectedStartId}
          selectedEndId={selectedEndId}
          onSelectStart={onSelectStart}
          onSelectEnd={onSelectEnd}
          onCalculateRoute={onCalculateRoute}
          onClearRoute={onClearRoute}
        />

        {/* Milestone Stepper or Empty Prompt */}
        <div className="flex-1 overflow-hidden">
          {routeResult ? (
            <MilestoneStepper
              routeResult={routeResult}
              currentIndex={currentMilestoneIndex}
              onSelectMilestone={onSelectMilestone}
              onNextMilestone={onNextMilestone}
              onPrevMilestone={onPrevMilestone}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center mb-3 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Visual Milestone Navigation</h4>
              <p className="text-xs text-gray-400 max-w-xs">
                Select your starting room and destination room above to calculate your milestone route.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Map Viewport (Expansive Floor Plan) */}
      <main className="flex-1 relative h-full overflow-hidden">
        <FloorPlanViewer
          graph={graph}
          currentFloor={currentFloor}
          routeResult={routeResult}
          currentMilestoneIndex={currentMilestoneIndex}
          onFloorChange={onFloorChange}
          onSelectMilestone={onSelectMilestone}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />
      </main>
    </div>
  );
};
