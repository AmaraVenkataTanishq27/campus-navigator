import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Navigation, MapPin, Sparkles, ChevronDown, Check, X } from 'lucide-react';
import { CampusGraph } from '../types/navigation';

export const getRoomCategory = (label: string, roomNumber?: string) => {
  const l = `${label} ${roomNumber || ''}`.toLowerCase();
  if (l.includes('lab') || l.includes('physics') || l.includes('chemistry') || l.includes('computer')) {
    return { name: 'Lab', color: 'bg-teal-50 text-teal-700 border-teal-200' };
  }
  if (l.includes('office') || l.includes('principal') || l.includes('dean') || l.includes('board') || l.includes('doctoral')) {
    return { name: 'Office', color: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  if (l.includes('auditorium') || l.includes('seminar') || l.includes('hall')) {
    return { name: 'Hall', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (l.includes('library')) {
    return { name: 'Library', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  }
  return { name: 'Classroom', color: 'bg-blue-50 text-blue-700 border-blue-200' };
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
    <div className="relative bg-white border-b border-slate-300 p-4 space-y-3.5 z-30 shadow-sm">
      {/* Invisible backdrop to dismiss dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floor Filter Tabs */}
      <div className="flex items-center justify-between text-xs pb-1 relative z-20">
        <span className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">Filter by Floor:</span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300">
          {(['all', ...availableFloors] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterFloor(f)}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                filterFloor === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-950 hover:bg-slate-200'
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
              className="sharp-input flex items-center rounded-xl px-3.5 py-2.5 cursor-text transition-all bg-white border border-slate-300"
            >
              <span className="w-3 h-3 rounded-full bg-blue-600 mr-2.5 flex-shrink-0 shadow-sm shadow-blue-500/50" />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-blue-700 tracking-wider leading-tight">Start Room</span>
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
                  className="bg-transparent text-sm text-slate-950 font-bold placeholder-slate-400 w-full focus:outline-none pr-1 truncate"
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
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition flex-shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 pointer-events-none stroke-[2.5]" />
              )}
            </div>

            {/* Start Dropdown */}
            {activeDropdown === 'start' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-xl z-50 divide-y divide-slate-100">
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
                            ? 'bg-blue-50 text-blue-800 font-bold border-l-4 border-blue-600'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 stroke-[2.5]" />}
                          <span className={`truncate ${isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-900'}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className="text-slate-500 text-[11px] flex-shrink-0">
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
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-300">
                            {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-center text-xs text-slate-500 font-semibold">No rooms found matching "{startQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Destination Room Input */}
          <div className={`relative ${activeDropdown === 'end' ? 'z-50' : 'z-20'}`}>
            <div
              onClick={() => setActiveDropdown('end')}
              className="sharp-input flex items-center rounded-xl px-3.5 py-2.5 cursor-text transition-all bg-white border border-slate-300"
            >
              <MapPin className="w-4 h-4 text-orange-600 mr-2.5 flex-shrink-0 stroke-[2.2]" />
              <div className="flex-1 flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-orange-700 tracking-wider leading-tight">Destination</span>
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
                  className="bg-transparent text-sm text-slate-950 font-bold placeholder-slate-400 w-full focus:outline-none pr-1 truncate"
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
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition flex-shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 pointer-events-none stroke-[2.5]" />
              )}
            </div>

            {/* Destination Dropdown */}
            {activeDropdown === 'end' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-300 rounded-xl shadow-xl z-50 divide-y divide-slate-100">
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
                            ? 'bg-orange-50 text-orange-800 font-bold border-l-4 border-orange-500'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className="w-4 h-4 text-orange-600 flex-shrink-0 stroke-[2.5]" />}
                          <span className={`truncate ${isSelected ? 'text-orange-950 font-extrabold' : 'text-slate-900'}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className="text-slate-500 text-[11px] flex-shrink-0">
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
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-[10px] border border-slate-300">
                            {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-center text-xs text-slate-500 font-semibold">No rooms found matching "{endQuery}"</div>
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
          className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 text-slate-800 hover:text-blue-600 transition shadow-sm flex items-center justify-center self-stretch flex-shrink-0"
        >
          <ArrowUpDown className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 relative z-10 pt-1">
        <button
          onClick={() => onCalculateRoute()}
          disabled={!selectedStartId || !selectedEndId}
          className="flex-1 py-3 px-4 sharp-btn-royal font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-md"
        >
          <Navigation className="w-4 h-4 fill-white stroke-white" />
          <span>Find Route</span>
        </button>

        {(selectedStartId || selectedEndId) && (
          <button
            onClick={handleClearAll}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Route Presets (Collapsible to save vertical room for milestones) */}
      <div className="pt-2 border-t border-slate-200 relative z-10">
        <button
          type="button"
          onClick={() => setPresetsExpanded(!presetsExpanded)}
          className="w-full flex items-center justify-between text-xs text-slate-700 font-extrabold mb-1.5 uppercase tracking-wider hover:text-slate-950 transition"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick Presets {isRouteActive && !presetsExpanded && '(4)'}</span>
          </div>
          <span className="text-[11px] font-bold text-blue-600 normal-case">
            {presetsExpanded ? 'Collapse ▲' : 'Show (4) ▼'}
          </span>
        </button>
        {presetsExpanded && (
          <div className="grid grid-cols-2 gap-2 mt-1">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset.from, preset.to)}
                className="sharp-card px-3 py-2.5 rounded-xl text-left text-xs transition border border-slate-200 hover:border-blue-500 bg-white group shadow-sm"
              >
                <div className="font-extrabold text-slate-900 group-hover:text-blue-600 truncate transition">
                  {preset.label}
                </div>
                <div className="text-[11px] text-blue-600 font-bold mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
