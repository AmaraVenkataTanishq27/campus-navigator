import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Navigation, MapPin, Sparkles, ChevronDown, Check, X } from 'lucide-react';
import { CampusGraph } from '../types/navigation';

export const getRoomCategory = (label: string, roomNumber?: string) => {
  const l = `${label} ${roomNumber || ''}`.toLowerCase();
  if (l.includes('lab') || l.includes('physics') || l.includes('chemistry') || l.includes('computer')) {
    return { name: 'Lab', color: 'bg-cyan-950/80 text-[#00F0FF] border-cyan-800/80 shadow-[0_0_6px_rgba(0,240,255,0.2)]' };
  }
  if (l.includes('office') || l.includes('principal') || l.includes('dean') || l.includes('board') || l.includes('doctoral')) {
    return { name: 'Office', color: 'bg-fuchsia-950/80 text-[#FF007F] border-fuchsia-800/80 shadow-[0_0_6px_rgba(255,0,127,0.2)]' };
  }
  if (l.includes('auditorium') || l.includes('seminar') || l.includes('hall')) {
    return { name: 'Hall', color: 'bg-amber-950/80 text-amber-400 border-amber-800/80' };
  }
  if (l.includes('library')) {
    return { name: 'Library', color: 'bg-purple-950/80 text-purple-300 border-purple-800/80' };
  }
  return { name: 'Classroom', color: 'bg-blue-950/80 text-blue-300 border-blue-800/80' };
};

interface RouteSelectorProps {
  graph: CampusGraph;
  selectedStartId: string | null;
  selectedEndId: string | null;
  onSelectStart: (id: string | null) => void;
  onSelectEnd: (id: string | null) => void;
  onCalculateRoute: (startId?: string, endId?: string) => void;
  onClearRoute: () => void;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  graph,
  selectedStartId,
  selectedEndId,
  onSelectStart,
  onSelectEnd,
  onCalculateRoute,
  onClearRoute
}) => {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<'start' | 'end' | null>(null);
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');

  const isRouteActive = Boolean(selectedStartId && selectedEndId);
  const [presetsExpanded, setPresetsExpanded] = useState(!isRouteActive);

  // Auto-collapse presets when route becomes active to give full space to milestone stepper
  useEffect(() => {
    if (isRouteActive) {
      setPresetsExpanded(false);
    }
  }, [isRouteActive]);

  // Filter ONLY rooms
  const roomNodes = useMemo(() => {
    return Object.entries(graph.nodes)
      .filter(([_, node]) => node.type === 'room')
      .map(([id, node]) => ({
        id,
        ...node
      }))
      .sort((a, b) => {
        if (a.floor !== b.floor) return a.floor - b.floor;
        return (a.roomNumber || a.label).localeCompare(b.roomNumber || b.label, undefined, { numeric: true });
      });
  }, [graph]);

  const filterRooms = (query: string) => {
    return roomNodes.filter((room) => {
      if (filterFloor !== 'all' && room.floor !== filterFloor) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      const matchLabel = room.label.toLowerCase().includes(q);
      const matchNum = room.roomNumber?.toLowerCase().includes(q) || false;
      const matchAlias = room.aliases?.some(a => a.toLowerCase().includes(q)) || false;
      return matchLabel || matchNum || matchAlias;
    });
  };

  const filteredStartRooms = useMemo(() => filterRooms(startQuery), [roomNodes, startQuery, filterFloor]);
  const filteredEndRooms = useMemo(() => filterRooms(endQuery), [roomNodes, endQuery, filterFloor]);

  const handleSwap = () => {
    const tempStart = selectedStartId;
    const tempEnd = selectedEndId;
    setStartQuery('');
    setEndQuery('');
    setActiveDropdown(null);
    onSelectStart(tempEnd);
    onSelectEnd(tempStart);
    if (tempEnd && tempStart) {
      onCalculateRoute(tempEnd, tempStart);
    }
  };

  const availableFloors = useMemo(() => {
    return Object.keys(graph.floors).map(Number).sort((a, b) => a - b);
  }, [graph]);

  const startNode = selectedStartId ? graph.nodes[selectedStartId] : null;
  const endNode = selectedEndId ? graph.nodes[selectedEndId] : null;

  // Preset quick navigation pairs
  const presets = [
    { label: 'AB 601 → AB 603', from: 'R_AB_601', to: 'R_AB_603', desc: 'Floor 4 Hallway' },
    { label: 'AB 601 → AB 608', from: 'R_AB_601', to: 'R_AB_608', desc: 'Floor 4 Corner' },
    { label: 'AB 501 → AB 701', from: 'R_AB_501', to: 'R_AB_701', desc: 'Floor 3 to 5' },
    { label: 'AB 201 → AB 601', from: 'R_AB_201', to: 'R_AB_601', desc: 'Ground to Floor 4' }
  ];

  const handleSelectPreset = (from: string, to: string) => {
    setStartQuery('');
    setEndQuery('');
    setActiveDropdown(null);
    onSelectStart(from);
    onSelectEnd(to);
    onCalculateRoute(from, to);
  };

  const handleClearAll = () => {
    setStartQuery('');
    setEndQuery('');
    setActiveDropdown(null);
    onClearRoute();
  };

  return (
    <div className="relative bg-[#0B1120] border-b border-[#1E293B] p-4 space-y-3.5 z-30 shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
      {/* Invisible backdrop to dismiss dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floor Filter Tabs */}
      <div className="flex items-center justify-between text-xs pb-1 relative z-20">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Filter Floor:</span>
        <div className="flex items-center gap-1 bg-[#070B14] p-1 rounded-xl border border-[#1E293B]">
          {(['all', ...availableFloors] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterFloor(f)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                filterFloor === f
                  ? 'bg-[#00F0FF] text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? 'All' : f === 0 ? 'G' : `F${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Start and End Inputs */}
      <div className={`flex items-center gap-2 relative ${activeDropdown ? 'z-40' : 'z-20'}`}>
        <div className="flex-1 space-y-2">
          {/* Start Room Input */}
          <div className={`relative ${activeDropdown === 'start' ? 'z-50' : 'z-20'}`}>
            <div
              onClick={() => setActiveDropdown('start')}
              className="sharp-input flex items-center rounded-xl px-3.5 py-2.5 cursor-text transition-all bg-[#070B14] border border-[#1E293B]"
            >
              <span className="w-3 h-3 rounded-full bg-[#00F0FF] mr-2.5 flex-shrink-0 shadow-[0_0_8px_#00F0FF]" />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-[#00F0FF] tracking-wider leading-tight">Start Room</span>
                <input
                  type="text"
                  placeholder="Select or enter room..."
                  value={startQuery !== '' ? startQuery : startNode ? `${startNode.label} (${startNode.floor === 0 ? 'Ground' : `Floor ${startNode.floor}`})` : ''}
                  onChange={(e) => {
                    setStartQuery(e.target.value);
                    onSelectStart(null);
                    setActiveDropdown('start');
                  }}
                  onFocus={() => setActiveDropdown('start')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (filteredStartRooms.length > 0) {
                        const sel = filteredStartRooms[0];
                        onSelectStart(sel.id);
                        setStartQuery('');
                        setActiveDropdown(null);
                        if (selectedEndId) {
                          onCalculateRoute(sel.id, selectedEndId);
                        }
                      }
                    } else if (e.key === 'Escape') {
                      setActiveDropdown(null);
                    }
                  }}
                  className="bg-transparent text-sm text-white font-bold placeholder-slate-500 w-full focus:outline-none pr-1 truncate"
                />
              </div>
              {startNode || startQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectStart(null);
                    setStartQuery('');
                    setActiveDropdown('start');
                  }}
                  title="Clear start room"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 pointer-events-none stroke-[2.5]" />
              )}
            </div>

            {/* Start Dropdown */}
            {activeDropdown === 'start' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-[#0B1120] border border-[#1E293B] rounded-xl shadow-2xl z-50 divide-y divide-[#1E293B]">
                {filteredStartRooms.length > 0 ? (
                  filteredStartRooms.map((room) => {
                    const isSelected = room.id === selectedStartId;
                    const showSecondary = room.roomNumber && !room.label.toLowerCase().includes(room.roomNumber.toLowerCase());
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          onSelectStart(room.id);
                          setStartQuery('');
                          setActiveDropdown(null);
                          if (selectedEndId) {
                            onCalculateRoute(room.id, selectedEndId);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-cyan-950/60 text-[#00F0FF] font-bold border-l-4 border-[#00F0FF]'
                            : 'hover:bg-slate-800/70 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className="w-4 h-4 text-[#00F0FF] flex-shrink-0 stroke-[2.5]" />}
                          <span className={`truncate ${isSelected ? 'text-[#00F0FF] font-extrabold' : 'text-slate-100'}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className="text-slate-400 text-[11px] flex-shrink-0">
                              (Room {room.roomNumber})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {(() => {
                            const cat = getRoomCategory(room.label, room.roomNumber);
                            return (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cat.color}`}>
                                {cat.name}
                              </span>
                            );
                          })()}
                          <span className="px-2 py-0.5 rounded-full bg-[#070B14] text-slate-300 font-mono font-bold text-[10px] border border-[#1E293B]">
                            {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-center text-xs text-slate-400 font-semibold">No rooms found matching "{startQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Destination Room Input */}
          <div className={`relative ${activeDropdown === 'end' ? 'z-50' : 'z-20'}`}>
            <div
              onClick={() => setActiveDropdown('end')}
              className="sharp-input flex items-center rounded-xl px-3.5 py-2.5 cursor-text transition-all bg-[#070B14] border border-[#1E293B]"
            >
              <MapPin className="w-4 h-4 text-[#FF007F] mr-2.5 flex-shrink-0 stroke-[2.2] drop-shadow-[0_0_6px_#FF007F]" />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-[#FF007F] tracking-wider leading-tight">Destination</span>
                <input
                  type="text"
                  placeholder="Select or enter destination..."
                  value={endQuery !== '' ? endQuery : endNode ? `${endNode.label} (${endNode.floor === 0 ? 'Ground' : `Floor ${endNode.floor}`})` : ''}
                  onChange={(e) => {
                    setEndQuery(e.target.value);
                    onSelectEnd(null);
                    setActiveDropdown('end');
                  }}
                  onFocus={() => setActiveDropdown('end')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (filteredEndRooms.length > 0) {
                        const sel = filteredEndRooms[0];
                        onSelectEnd(sel.id);
                        setEndQuery('');
                        setActiveDropdown(null);
                        if (selectedStartId) {
                          onCalculateRoute(selectedStartId, sel.id);
                        }
                      }
                    } else if (e.key === 'Escape') {
                      setActiveDropdown(null);
                    }
                  }}
                  className="bg-transparent text-sm text-white font-bold placeholder-slate-500 w-full focus:outline-none pr-1 truncate"
                />
              </div>
              {endNode || endQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEnd(null);
                    setEndQuery('');
                    setActiveDropdown('end');
                  }}
                  title="Clear destination room"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex-shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 pointer-events-none stroke-[2.5]" />
              )}
            </div>

            {/* Destination Dropdown */}
            {activeDropdown === 'end' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-[#0B1120] border border-[#1E293B] rounded-xl shadow-2xl z-50 divide-y divide-[#1E293B]">
                {filteredEndRooms.length > 0 ? (
                  filteredEndRooms.map((room) => {
                    const isSelected = room.id === selectedEndId;
                    const showSecondary = room.roomNumber && !room.label.toLowerCase().includes(room.roomNumber.toLowerCase());
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          onSelectEnd(room.id);
                          setEndQuery('');
                          setActiveDropdown(null);
                          if (selectedStartId) {
                            onCalculateRoute(selectedStartId, room.id);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-fuchsia-950/60 text-[#FF007F] font-bold border-l-4 border-[#FF007F]'
                            : 'hover:bg-slate-800/70 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className="w-4 h-4 text-[#FF007F] flex-shrink-0 stroke-[2.5]" />}
                          <span className={`truncate ${isSelected ? 'text-[#FF007F] font-extrabold' : 'text-slate-100'}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className="text-slate-400 text-[11px] flex-shrink-0">
                              (Room {room.roomNumber})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {(() => {
                            const cat = getRoomCategory(room.label, room.roomNumber);
                            return (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cat.color}`}>
                                {cat.name}
                              </span>
                            );
                          })()}
                          <span className="px-2 py-0.5 rounded-full bg-[#070B14] text-slate-300 font-mono font-bold text-[10px] border border-[#1E293B]">
                            {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-center text-xs text-slate-400 font-semibold">No rooms found matching "{endQuery}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={handleSwap}
          title="Swap start & destination rooms"
          className="p-3 rounded-xl bg-[#070B14] hover:bg-[#0F172A] active:scale-95 border border-[#1E293B] hover:border-[#00F0FF]/40 text-slate-300 hover:text-[#00F0FF] transition shadow-sm flex items-center justify-center self-stretch flex-shrink-0"
        >
          <ArrowUpDown className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 relative z-10 pt-1">
        <button
          onClick={() => onCalculateRoute()}
          disabled={!selectedStartId || !selectedEndId}
          className="flex-1 py-3 px-4 sharp-btn-royal font-black text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg"
        >
          <Navigation className="w-4 h-4 fill-slate-950 stroke-slate-950" />
          <span>INITIALIZE ROUTE</span>
        </button>

        {(selectedStartId || selectedEndId) && (
          <button
            onClick={handleClearAll}
            className="px-4 py-3 bg-[#070B14] hover:bg-[#0F172A] text-slate-400 hover:text-white text-xs font-bold rounded-xl border border-[#1E293B] transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Route Presets (Collapsible to save vertical room for milestones) */}
      <div className="pt-2 border-t border-[#1E293B] relative z-10">
        <button
          type="button"
          onClick={() => setPresetsExpanded(!presetsExpanded)}
          className="w-full flex items-center justify-between text-xs text-slate-400 font-extrabold mb-1.5 uppercase tracking-wider hover:text-white transition"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span>Presets {isRouteActive && !presetsExpanded && '(4)'}</span>
          </div>
          <span className="text-[11px] font-bold text-[#00F0FF] normal-case">
            {presetsExpanded ? 'Collapse ▲' : 'Show (4) ▼'}
          </span>
        </button>
        {presetsExpanded && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset.from, preset.to)}
                className="sharp-card px-3 py-2.5 rounded-xl text-left text-xs transition border border-[#1E293B] hover:border-[#00F0FF]/60 bg-[#070B14] group shadow-sm"
              >
                <div className="font-extrabold text-slate-200 group-hover:text-[#00F0FF] truncate transition">
                  {preset.label}
                </div>
                <div className="text-[11px] text-[#00F0FF] font-bold mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
