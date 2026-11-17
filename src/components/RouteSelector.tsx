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
  theme?: 'cyberpunk' | 'beige';
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  graph,
  selectedStartId,
  selectedEndId,
  onSelectStart,
  onSelectEnd,
  onCalculateRoute,
  onClearRoute,
  theme = 'cyberpunk'
}) => {
  const isCyber = theme === 'cyberpunk';
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
    <div className={`relative border-b p-4 space-y-3.5 z-30 transition-colors duration-200 ${
      isCyber
        ? 'bg-[#0B1120] border-[#1E293B] shadow-[0_4px_25px_rgba(0,0,0,0.6)]'
        : 'bg-[#FAF8F5] border-[#E7E2DA] shadow-sm'
    }`}>
      {/* Invisible backdrop to dismiss dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floor Filter Tabs */}
      <div className="flex items-center justify-between text-xs pb-1 relative z-20">
        <span className={`font-bold uppercase tracking-wider text-[11px] ${
          isCyber ? 'text-slate-400' : 'text-stone-500'
        }`}>Filter Floor:</span>
        <div className={`flex items-center gap-1 p-1 rounded-xl border ${
          isCyber ? 'bg-[#070B14] border-[#1E293B]' : 'bg-[#F2EEE9] border-[#E2DDD5]'
        }`}>
          {(['all', ...availableFloors] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterFloor(f)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                filterFloor === f
                  ? isCyber
                    ? 'bg-[#00F0FF] text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-[#1E40AF] text-white font-black shadow-sm'
                  : isCyber
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-[#EBE6DF]'
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
              className={`sharp-input flex items-center rounded-xl px-3.5 py-2.5 cursor-text transition-all border ${
                isCyber
                  ? 'bg-[#070B14] border-[#1E293B]'
                  : 'bg-[#F2EEE9] border-[#E2DDD5]'
              }`}
            >
              <span className={`w-3 h-3 rounded-full mr-2.5 flex-shrink-0 ${
                isCyber ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#1E40AF]'
              }`} />
              <div className="flex-1 flex flex-col min-w-0">
                <span className={`text-[10px] uppercase font-extrabold tracking-wider leading-tight ${
                  isCyber ? 'text-[#00F0FF]' : 'text-blue-700'
                }`}>Start Room</span>
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
                  className={`bg-transparent text-sm font-bold w-full focus:outline-none pr-1 truncate ${
                    isCyber ? 'text-white placeholder-slate-500' : 'text-stone-900 placeholder-stone-400'
                  }`}
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
                  className={`p-1 rounded-lg transition flex-shrink-0 ${
                    isCyber ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-stone-500 hover:text-stone-900 hover:bg-[#EBE6DF]'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 pointer-events-none stroke-[2.5]" />
              )}
            </div>

            {/* Start Dropdown */}
            {activeDropdown === 'start' && (
              <div className={`absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl shadow-2xl z-50 border divide-y ${
                isCyber
                  ? 'bg-[#0B1120] border-[#1E293B] divide-[#1E293B]'
                  : 'bg-[#FAF8F5] border-[#E7E2DA] divide-[#E7E2DA]'
              }`}>
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
                            ? isCyber
                              ? 'bg-cyan-950/60 text-[#00F0FF] font-bold border-l-4 border-[#00F0FF]'
                              : 'bg-blue-50 text-blue-800 font-bold border-l-4 border-blue-600'
                            : isCyber
                            ? 'hover:bg-slate-800/70 text-slate-200'
                            : 'hover:bg-[#F2EEE9] text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className={`w-4 h-4 flex-shrink-0 stroke-[2.5] ${isCyber ? 'text-[#00F0FF]' : 'text-blue-700'}`} />}
                          <span className={`truncate ${isSelected ? (isCyber ? 'text-[#00F0FF] font-extrabold' : 'text-blue-900 font-extrabold') : (isCyber ? 'text-slate-100' : 'text-stone-800')}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className={`text-[11px] flex-shrink-0 ${isCyber ? 'text-slate-400' : 'text-stone-500'}`}>
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
                          <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                            isCyber
                              ? 'bg-[#070B14] text-slate-300 border-[#1E293B]'
                              : 'bg-[#F2EEE9] text-stone-700 border-[#E2DDD5]'
                          }`}>
                            {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className={`p-3.5 text-center text-xs font-semibold ${isCyber ? 'text-slate-400' : 'text-stone-500'}`}>No rooms found matching "{startQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Destination Room Input */}
          <div className={`relative ${activeDropdown === 'end' ? 'z-50' : 'z-20'}`}>
            <div
              onClick={() => setActiveDropdown('end')}
              className={`sharp-input flex items-center rounded-xl px-3.5 py-2.5 cursor-text transition-all border ${
                isCyber
                  ? 'bg-[#070B14] border-[#1E293B]'
                  : 'bg-[#F2EEE9] border-[#E2DDD5]'
              }`}
            >
              <MapPin className={`w-4 h-4 mr-2.5 flex-shrink-0 stroke-[2.2] ${
                isCyber ? 'text-[#FF007F] drop-shadow-[0_0_6px_#FF007F]' : 'text-rose-600'
              }`} />
              <div className="flex-1 flex flex-col min-w-0">
                <span className={`text-[10px] uppercase font-extrabold tracking-wider leading-tight ${
                  isCyber ? 'text-[#FF007F]' : 'text-rose-600'
                }`}>Destination</span>
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
                  className={`bg-transparent text-sm font-bold w-full focus:outline-none pr-1 truncate ${
                    isCyber ? 'text-white placeholder-slate-500' : 'text-stone-900 placeholder-stone-400'
                  }`}
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
                  className={`p-1 rounded-lg transition flex-shrink-0 ${
                    isCyber ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-stone-500 hover:text-stone-900 hover:bg-[#EBE6DF]'
                  }`}
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 pointer-events-none stroke-[2.5]" />
              )}
            </div>

            {/* Destination Dropdown */}
            {activeDropdown === 'end' && (
              <div className={`absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl shadow-2xl z-50 border divide-y ${
                isCyber
                  ? 'bg-[#0B1120] border-[#1E293B] divide-[#1E293B]'
                  : 'bg-[#FAF8F5] border-[#E7E2DA] divide-[#E7E2DA]'
              }`}>
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
                            ? isCyber
                              ? 'bg-fuchsia-950/60 text-[#FF007F] font-bold border-l-4 border-[#FF007F]'
                              : 'bg-rose-50 text-rose-800 font-bold border-l-4 border-rose-600'
                            : isCyber
                            ? 'hover:bg-slate-800/70 text-slate-200'
                            : 'hover:bg-[#F2EEE9] text-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className={`w-4 h-4 flex-shrink-0 stroke-[2.5] ${isCyber ? 'text-[#FF007F]' : 'text-rose-600'}`} />}
                          <span className={`truncate ${isSelected ? (isCyber ? 'text-[#FF007F] font-extrabold' : 'text-rose-900 font-extrabold') : (isCyber ? 'text-slate-100' : 'text-stone-800')}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className={`text-[11px] flex-shrink-0 ${isCyber ? 'text-slate-400' : 'text-stone-500'}`}>
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
                          <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] border ${
                            isCyber
                              ? 'bg-[#070B14] text-slate-300 border-[#1E293B]'
                              : 'bg-[#F2EEE9] text-stone-700 border-[#E2DDD5]'
                          }`}>
                            {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className={`p-3.5 text-center text-xs font-semibold ${isCyber ? 'text-slate-400' : 'text-stone-500'}`}>No rooms found matching "{endQuery}"</div>
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
          className={`p-3 rounded-xl border transition shadow-sm flex items-center justify-center self-stretch flex-shrink-0 active:scale-95 ${
            isCyber
              ? 'bg-[#070B14] hover:bg-[#0F172A] border-[#1E293B] hover:border-[#00F0FF]/40 text-slate-300 hover:text-[#00F0FF]'
              : 'bg-[#F2EEE9] hover:bg-[#EBE6DF] border-[#E2DDD5] text-stone-700 hover:text-blue-700'
          }`}
        >
          <ArrowUpDown className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 relative z-10 pt-1">
        <button
          onClick={() => onCalculateRoute()}
          disabled={!selectedStartId || !selectedEndId}
          className={`flex-1 py-3 px-4 font-black text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg transition-transform active:scale-[0.98] ${
            isCyber
              ? 'sharp-btn-royal text-slate-950'
              : 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-blue-900/20'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isCyber ? 'fill-slate-950 stroke-slate-950' : 'fill-white stroke-white'}`} />
          <span>INITIALIZE ROUTE</span>
        </button>

        {(selectedStartId || selectedEndId) && (
          <button
            onClick={handleClearAll}
            className={`px-4 py-3 text-xs font-bold rounded-xl border transition ${
              isCyber
                ? 'bg-[#070B14] hover:bg-[#0F172A] text-slate-400 hover:text-white border-[#1E293B]'
                : 'bg-[#F2EEE9] hover:bg-[#EBE6DF] text-stone-600 hover:text-stone-900 border-[#E2DDD5]'
            }`}
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Route Presets */}
      <div className={`pt-2 border-t relative z-10 ${isCyber ? 'border-[#1E293B]' : 'border-[#E7E2DA]'}`}>
        <button
          type="button"
          onClick={() => setPresetsExpanded(!presetsExpanded)}
          className={`w-full flex items-center justify-between text-xs font-extrabold mb-1.5 uppercase tracking-wider transition ${
            isCyber ? 'text-slate-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className={`w-3.5 h-3.5 ${isCyber ? 'text-[#00F0FF]' : 'text-blue-700'}`} />
            <span>Presets {isRouteActive && !presetsExpanded && '(4)'}</span>
          </div>
          <span className={`text-[11px] font-bold normal-case ${isCyber ? 'text-[#00F0FF]' : 'text-blue-700'}`}>
            {presetsExpanded ? 'Collapse ▲' : 'Show (4) ▼'}
          </span>
        </button>
        {presetsExpanded && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset.from, preset.to)}
                className={`sharp-card px-3 py-2.5 rounded-xl text-left text-xs transition border group shadow-sm ${
                  isCyber
                    ? 'border-[#1E293B] hover:border-[#00F0FF]/60 bg-[#070B14]'
                    : 'border-[#E2DDD5] hover:border-blue-500 bg-[#F2EEE9]'
                }`}
              >
                <div className={`font-extrabold truncate transition ${
                  isCyber ? 'text-slate-200 group-hover:text-[#00F0FF]' : 'text-stone-800 group-hover:text-blue-700'
                }`}>
                  {preset.label}
                </div>
                <div className={`text-[11px] font-bold mt-0.5 ${
                  isCyber ? 'text-[#00F0FF]' : 'text-blue-700'
                }`}>{preset.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
