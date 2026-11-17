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
  return (
    <header className="h-16 px-5 bg-white border-b border-slate-300 flex items-center justify-between z-30 select-none shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
          <Compass className="w-6 h-6 text-white stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900">
              Campus Navigator
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
              Apex Block
            </span>
          </div>
          <p className="text-xs text-slate-600 font-semibold">Indoor Landmark Navigation (Floors 0–6)</p>
        </div>
      </div>

      {/* Center: Current Floor Indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-300 shadow-sm">
        <MapPin className="w-4 h-4 text-blue-600 stroke-[2.2]" />
        <span>Currently viewing <span className="text-slate-950 font-extrabold">{currentFloor === 0 ? 'Ground Floor' : `Floor ${currentFloor}`}</span></span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {hasActiveRoute && (
          <button
            onClick={onResetRoute}
            title="Reset active route"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Accessibility Mode Toggle */}
        <button
          onClick={onToggleAccessible}
          title={accessibleOnly ? 'Accessibility routing active (Elevators only)' : 'Standard routing (Stairs + Elevators)'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition shadow-sm ${
            accessibleOnly
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Accessibility className="w-4 h-4 text-blue-600 stroke-[2.2]" />
          <span className="hidden lg:inline">{accessibleOnly ? 'Accessible' : 'Standard'}</span>
        </button>

        {/* Voice/Audio Prompts Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Voice milestone prompts enabled' : 'Voice prompts muted'}
          className={`p-2 text-xs font-bold rounded-xl border transition shadow-sm ${
            voiceEnabled
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-blue-600 stroke-[2.2]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Mapper Tool Link */}
        <a
          href="/mapper.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Visual Coordinate Mapper Tool"
          className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 rounded-xl border border-slate-300 transition shadow-sm"
        >
          <span>Map Coordinates</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
        </a>
      </div>
    </header>
  );
};
