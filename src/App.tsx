import React, { useState, useEffect, useCallback } from 'react';
import rawGraphData from './data/campus_graph.json';
import { CampusGraph, RouteResult } from './types/navigation';
import { buildRouteResult } from './engine/milestoneEngine';
import { Header } from './components/Header';
import { MainLayout } from './components/MainLayout';
import { ArrivalModal } from './components/ArrivalModal';

const graph = rawGraphData as unknown as CampusGraph;

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'cyberpunk' | 'beige'>('cyberpunk');
  const [currentFloor, setCurrentFloor] = useState<number>(4);
  const [selectedStartId, setSelectedStartId] = useState<string | null>('R_AB_601');
  const [selectedEndId, setSelectedEndId] = useState<string | null>('R_AB_603');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [currentMilestoneIndex, setCurrentMilestoneIndex] = useState<number>(0);
  const [arrivalModalOpen, setArrivalModalOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'cyberpunk' ? 'beige' : 'cyberpunk'));
  }, []);

  // Compute Route
  const handleCalculateRoute = useCallback((overrideStart?: string, overrideEnd?: string) => {
    const start = overrideStart ?? selectedStartId;
    const end = overrideEnd ?? selectedEndId;
    if (!start || !end) return;

    const res = buildRouteResult(graph, start, end, { accessibleOnly });
    if (res) {
      setRouteResult(res);
      setCurrentMilestoneIndex(0);
      setArrivalModalOpen(false);

      // Auto-set floor to start node's floor
      const startNode = graph.nodes[start];
      if (startNode) {
        setCurrentFloor(startNode.floor);
      }
    }
  }, [selectedStartId, selectedEndId, accessibleOnly]);

  // Recalculate if accessibility toggle changes with active route
  useEffect(() => {
    if (routeResult && selectedStartId && selectedEndId) {
      handleCalculateRoute();
    }
  }, [accessibleOnly]);

  // Clear Route
  const handleClearRoute = () => {
    setSelectedStartId(null);
    setSelectedEndId(null);
    setRouteResult(null);
    setCurrentMilestoneIndex(0);
    setArrivalModalOpen(false);
  };

  // Next Milestone with auto floor switching
  const handleNextMilestone = useCallback(() => {
    if (!routeResult) return;

    if (currentMilestoneIndex < routeResult.milestones.length - 1) {
      const nextIdx = currentMilestoneIndex + 1;
      setCurrentMilestoneIndex(nextIdx);

      const nextMs = routeResult.milestones[nextIdx];
      // Automatically switch floor plan if milestone moves to another floor
      if (nextMs && nextMs.floor !== currentFloor) {
        setCurrentFloor(nextMs.floor);
      }

      // Voice prompt
      if (voiceEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(nextMs.label);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      // Check if destination reached
      if (nextIdx === routeResult.milestones.length - 1) {
        setArrivalModalOpen(true);
      }
    }
  }, [routeResult, currentMilestoneIndex, currentFloor, voiceEnabled]);

  // Previous Milestone
  const handlePrevMilestone = useCallback(() => {
    if (!routeResult || currentMilestoneIndex === 0) return;
    const prevIdx = currentMilestoneIndex - 1;
    setCurrentMilestoneIndex(prevIdx);

    const prevMs = routeResult.milestones[prevIdx];
    if (prevMs && prevMs.floor !== currentFloor) {
      setCurrentFloor(prevMs.floor);
    }
  }, [routeResult, currentMilestoneIndex, currentFloor]);

  // Select specific milestone
  const handleSelectMilestone = (idx: number) => {
    if (!routeResult || !routeResult.milestones[idx]) return;
    setCurrentMilestoneIndex(idx);
    const ms = routeResult.milestones[idx];
    if (ms.floor !== currentFloor) {
      setCurrentFloor(ms.floor);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleNextMilestone();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevMilestone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextMilestone, handlePrevMilestone]);

  // Initial calculation on load
  useEffect(() => {
    handleCalculateRoute();
  }, []);

  const destNode = selectedEndId ? graph.nodes[selectedEndId] : null;

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${theme === 'cyberpunk' ? 'bg-[#050811] text-[#F1F5F9]' : 'bg-[#F6F3ED] text-[#1E293B]'}`}>
      {/* Top Header */}
      <Header
        graph={graph}
        currentFloor={currentFloor}
        onFloorChange={setCurrentFloor}
        accessibleOnly={accessibleOnly}
        onToggleAccessible={() => setAccessibleOnly((v) => !v)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((v) => !v)}
        onResetRoute={handleClearRoute}
        hasActiveRoute={!!routeResult}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Split Layout: Left Sidebar + Right Map */}
      <MainLayout
        graph={graph}
        currentFloor={currentFloor}
        onFloorChange={setCurrentFloor}
        selectedStartId={selectedStartId}
        selectedEndId={selectedEndId}
        onSelectStart={setSelectedStartId}
        onSelectEnd={setSelectedEndId}
        onCalculateRoute={handleCalculateRoute}
        onClearRoute={handleClearRoute}
        routeResult={routeResult}
        currentMilestoneIndex={currentMilestoneIndex}
        onSelectMilestone={handleSelectMilestone}
        onNextMilestone={handleNextMilestone}
        onPrevMilestone={handlePrevMilestone}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        theme={theme}
      />

      {/* Arrival Modal */}
      {routeResult && (
        <ArrivalModal
          isOpen={arrivalModalOpen}
          onClose={() => setArrivalModalOpen(false)}
          routeResult={routeResult}
          destLabel={destNode ? `${destNode.label} (Floor ${destNode.floor})` : 'Destination'}
          theme={theme}
        />
      )}
    </div>
  );
};

export default App;
