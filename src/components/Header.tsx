import React from 'react';
import { Compass, Accessibility, Volume2, VolumeX, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import { CampusGraph } from '../types/navigation';

interface HeaderProps {
  graph: CampusGraph;
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  accessibleOnly: boolean;
  onToggleAccessible: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onResetRoute: () => void;
  hasActiveRoute: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  graph,
  currentFloor,
  onFloorChange,
  accessibleOnly,
  onToggleAccessible,
  voiceEnabled,
  onToggleVoice,
  onResetRoute,
  hasActiveRoute
}) => {
  const availableFloors = Object.keys(graph.floors).map(Number).sort((a, b) => a - b);

  return (
    <header className="h-16 px-4 bg-[#0a0e17]/95 border-b border-gray-800/80 backdrop-blur-md flex items-center justify-between z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Compass className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">Campus Navigator</h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              Apex Block
            </span>
          </div>
          <p className="text-xs text-gray-400">Indoor Landmark Navigation (Floors 0–6)</p>
        </div>
      </div>

      {/* Center: Current Floor Indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-[#131b2e] px-3.5 py-1.5 rounded-xl border border-gray-700/60 shadow-inner">
        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
        <span>Currently viewing <span className="text-white font-bold">{currentFloor === 0 ? 'Ground Floor' : `Floor ${currentFloor}`}</span></span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {hasActiveRoute && (
          <button
            onClick={onResetRoute}
            title="Reset active route"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#131b2e] hover:bg-[#1a2337] text-gray-200 rounded-lg border border-gray-700/80 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Accessibility Mode Toggle */}
        <button
          onClick={onToggleAccessible}
          title={accessibleOnly ? 'Accessibility routing active (Elevators only)' : 'Standard routing (Stairs + Elevators)'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
            accessibleOnly
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20'
              : 'bg-[#131b2e] border-gray-700/80 text-gray-300 hover:text-white hover:bg-[#1a2337]'
          }`}
        >
          <Accessibility className="w-4 h-4 text-cyan-400" />
          <span className="hidden lg:inline">{accessibleOnly ? 'Accessible' : 'Standard'}</span>
        </button>

        {/* Voice/Audio Prompts Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Voice milestone prompts enabled' : 'Voice prompts muted'}
          className={`p-2 text-xs font-medium rounded-lg border transition ${
            voiceEnabled
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-[#131b2e] border-gray-700/80 text-gray-400 hover:text-white hover:bg-[#1a2337]'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Mapper Tool Link */}
        <a
          href="/mapper.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Visual Coordinate Mapper Tool"
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#131b2e] hover:bg-[#1a2337] text-gray-300 hover:text-white rounded-lg border border-gray-700/80 transition"
        >
          <span>Map Coordinates</span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
      </div>
    </header>
  );
};
