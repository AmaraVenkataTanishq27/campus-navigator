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
    <header className="h-16 px-5 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between z-30 select-none shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <Compass className="w-6 h-6 text-slate-950 stroke-[2.4]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Campus Navigator
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-black bg-cyan-950/70 text-[#00F0FF] rounded-full border border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.25)] tracking-wider">
              APEX // BLOCK
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Indoor Landmark Guidance (Floors 0–6)</p>
        </div>
      </div>

      {/* Center: Current Floor Indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-300 bg-[#070B14] px-4 py-1.5 rounded-full border border-[#1E293B] shadow-inner">
        <MapPin className="w-4 h-4 text-[#00F0FF] stroke-[2.4]" />
        <span>Currently viewing <span className="text-[#00F0FF] font-black">{currentFloor === 0 ? 'Ground Floor' : `Floor ${currentFloor}`}</span></span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {hasActiveRoute && (
          <button
            onClick={onResetRoute}
            title="Reset active route"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white rounded-xl border border-[#1E293B] hover:border-slate-600 transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Accessibility Mode Toggle */}
        <button
          onClick={onToggleAccessible}
          title={accessibleOnly ? 'Accessibility routing active (Elevators only)' : 'Standard routing (Stairs + Elevators)'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition shadow-sm ${
            accessibleOnly
              ? 'bg-cyan-950/80 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'bg-[#0F172A] border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600'
          }`}
        >
          <Accessibility className={`w-4 h-4 stroke-[2.2] ${accessibleOnly ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
          <span className="hidden lg:inline">{accessibleOnly ? 'Accessible' : 'Standard'}</span>
        </button>

        {/* Voice/Audio Prompts Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Voice milestone prompts enabled' : 'Voice prompts muted'}
          className={`p-2 text-xs font-bold rounded-xl border transition shadow-sm ${
            voiceEnabled
              ? 'bg-cyan-950/80 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'bg-[#0F172A] border-[#1E293B] text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4 text-[#00F0FF] stroke-[2.2]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Mapper Tool Link */}
        <a
          href="/mapper.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Visual Coordinate Mapper Tool"
          className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-[#00F0FF] rounded-xl border border-[#1E293B] transition shadow-sm"
        >
          <span>Map Grid</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
