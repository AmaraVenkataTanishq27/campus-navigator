import React from 'react';
import { Compass, Accessibility, Volume2, VolumeX, MapPin, ExternalLink, RefreshCw, Sun, Moon } from 'lucide-react';
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
  theme: 'cyberpunk' | 'beige';
  onToggleTheme: () => void;
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
  hasActiveRoute,
  theme,
  onToggleTheme
}) => {
  const isCyber = theme === 'cyberpunk';

  return (
    <header className={`h-16 px-5 border-b flex items-center justify-between z-30 select-none transition-colors duration-300 ${
      isCyber
        ? 'bg-[#0B1120]/95 backdrop-blur-md border-[#1E293B] shadow-[0_4px_25px_rgba(0,0,0,0.8)]'
        : 'bg-white border-slate-300 shadow-sm'
    }`}>
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
          isCyber
            ? 'bg-gradient-to-tr from-[#00F0FF] to-[#8B5CF6] text-slate-950 shadow-cyan-500/25'
            : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
        }`}>
          <Compass className="w-6 h-6 stroke-[2.4]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-base font-extrabold tracking-tight flex items-center gap-1.5 ${isCyber ? 'text-white' : 'text-slate-900'}`}>
              Campus Navigator
            </h1>
            <span className={`px-2.5 py-0.5 text-[11px] font-black rounded-full border tracking-wider ${
              isCyber
                ? 'bg-cyan-950/70 text-[#00F0FF] border-cyan-500/40 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              APEX // BLOCK
            </span>
          </div>
          <p className={`text-xs font-medium ${isCyber ? 'text-slate-400' : 'text-slate-600'}`}>Indoor Landmark Guidance (Floors 0–6)</p>
        </div>
      </div>

      {/* Center: Current Floor Indicator */}
      <div className={`hidden md:flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border shadow-inner ${
        isCyber
          ? 'text-slate-300 bg-[#070B14] border-[#1E293B]'
          : 'text-slate-700 bg-slate-100 border-slate-300'
      }`}>
        <MapPin className={`w-4 h-4 stroke-[2.4] ${isCyber ? 'text-[#00F0FF]' : 'text-blue-600'}`} />
        <span>Currently viewing <span className={`font-black ${isCyber ? 'text-[#00F0FF]' : 'text-slate-950'}`}>{currentFloor === 0 ? 'Ground Floor' : `Floor ${currentFloor}`}</span></span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* One-Click Theme Switcher (Warm Beige ⇄ Cyberpunk) */}
        <button
          onClick={onToggleTheme}
          title={isCyber ? 'Switch to Warm Beige theme' : 'Switch to Cyberpunk theme'}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
            isCyber
              ? 'bg-[#070B14] border-[#1E293B] text-amber-400 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(251,191,36,0.3)]'
              : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
          }`}
        >
          {isCyber ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          <span className="hidden sm:inline">{isCyber ? 'Beige UI' : 'Cyber UI'}</span>
        </button>

        {hasActiveRoute && (
          <button
            onClick={onResetRoute}
            title="Reset active route"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition shadow-sm ${
              isCyber
                ? 'bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-white border-[#1E293B]'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

        {/* Accessibility Mode Toggle */}
        <button
          onClick={onToggleAccessible}
          title={accessibleOnly ? 'Accessibility routing active (Elevators only)' : 'Standard routing (Stairs + Elevators)'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition shadow-sm ${
            accessibleOnly
              ? isCyber
                ? 'bg-cyan-950/80 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-blue-50 border-blue-500 text-blue-700'
              : isCyber
              ? 'bg-[#0F172A] border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600'
              : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Accessibility className={`w-4 h-4 stroke-[2.2] ${accessibleOnly ? (isCyber ? 'text-[#00F0FF]' : 'text-blue-600') : 'text-slate-400'}`} />
          <span className="hidden lg:inline">{accessibleOnly ? 'Accessible' : 'Standard'}</span>
        </button>

        {/* Voice/Audio Prompts Toggle */}
        <button
          onClick={onToggleVoice}
          title={voiceEnabled ? 'Voice milestone prompts enabled' : 'Voice prompts muted'}
          className={`p-2 text-xs font-bold rounded-xl border transition shadow-sm ${
            voiceEnabled
              ? isCyber
                ? 'bg-cyan-950/80 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                : 'bg-blue-50 border-blue-500 text-blue-700'
              : isCyber
              ? 'bg-[#0F172A] border-[#1E293B] text-slate-400 hover:text-white'
              : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {voiceEnabled ? <Volume2 className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#00F0FF]' : 'text-blue-600'}`} /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Mapper Tool Link */}
        <a
          href="/mapper.html"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Visual Coordinate Mapper Tool"
          className={`hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition shadow-sm ${
            isCyber
              ? 'bg-[#0F172A] hover:bg-[#1E293B] text-slate-300 hover:text-[#00F0FF] border-[#1E293B]'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          <span>Map Grid</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
