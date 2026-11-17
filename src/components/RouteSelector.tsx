import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Navigation, MapPin, Sparkles, ChevronDown, Check, X } from 'lucide-react';
import { CampusGraph } from '../types/navigation';

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

  // Filter ONLY rooms (Requirement: start and end points should be only room no)
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

  // Preset quick navigation pairs across floors using valid graph node IDs
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
    <div className="relative bg-[#0d121f] border-b border-gray-800/80 p-4 space-y-3 z-30">
      {/* Invisible backdrop to dismiss dropdown when clicked outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floor Filter Tabs for Room Selection */}
      <div className="flex items-center justify-between text-xs pb-1 relative z-20">
        <span className="text-gray-400 font-medium">Filter Rooms by Floor:</span>
        <div className="flex items-center gap-1 bg-[#131b2e] p-0.5 rounded-lg border border-gray-700/60">
          {(['all', ...availableFloors] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterFloor(f)}
              className={`px-2 py-0.5 rounded font-medium text-xs transition ${
                filterFloor === f
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f === 'all' ? 'All' : f === 0 ? 'G' : `F${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Start and End Inputs with dedicated Swap Button */}
      <div className={`flex items-center gap-2 relative ${activeDropdown ? 'z-40' : 'z-20'}`}>
        <div className="flex-1 space-y-2">
          {/* Start Room Input */}
          <div className={`relative ${activeDropdown === 'start' ? 'z-50' : 'z-20'}`}>
            <div
              onClick={() => setActiveDropdown('start')}
              className="flex items-center bg-[#131b2e] border border-gray-700/80 rounded-xl px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition shadow-inner cursor-text"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
              <input
                type="text"
                placeholder="Start room (e.g. 201, 601)..."
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
                className="bg-transparent text-xs text-white placeholder-gray-500 w-full focus:outline-none pr-1"
              />
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
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 pointer-events-none" />
              )}
            </div>

            {/* Start Dropdown */}
            {activeDropdown === 'start' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-[#131b2e] border border-gray-700 rounded-xl shadow-2xl z-50 divide-y divide-gray-800/80">
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
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs transition ${
                          isSelected
                            ? 'bg-emerald-950/60 text-emerald-300 font-semibold border-l-2 border-emerald-500'
                            : 'hover:bg-[#1c2742] text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                          <span className={`truncate ${isSelected ? 'text-emerald-300 font-semibold' : 'text-white'}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className="text-gray-400 text-[11px] flex-shrink-0">
                              (Room {room.roomNumber})
                            </span>
                          )}
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 text-emerald-400 font-mono text-[10px] border border-emerald-500/30 flex-shrink-0">
                          {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">No rooms found matching "{startQuery}"</div>
                )}
              </div>
            )}
          </div>

          {/* Destination Room Input */}
          <div className={`relative ${activeDropdown === 'end' ? 'z-50' : 'z-20'}`}>
            <div
              onClick={() => setActiveDropdown('end')}
              className="flex items-center bg-[#131b2e] border border-gray-700/80 rounded-xl px-3 py-2 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30 transition shadow-inner cursor-text"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Destination room (e.g. 603, 701)..."
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
                className="bg-transparent text-xs text-white placeholder-gray-500 w-full focus:outline-none pr-1"
              />
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
                  className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 pointer-events-none" />
              )}
            </div>

            {/* Destination Dropdown */}
            {activeDropdown === 'end' && (
              <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-[#131b2e] border border-gray-700 rounded-xl shadow-2xl z-50 divide-y divide-gray-800/80">
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
                        className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs transition ${
                          isSelected
                            ? 'bg-cyan-950/60 text-cyan-300 font-semibold border-l-2 border-cyan-500'
                            : 'hover:bg-[#1c2742] text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-2">
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                          <span className={`truncate ${isSelected ? 'text-cyan-300 font-semibold' : 'text-white'}`}>
                            {room.label}
                          </span>
                          {showSecondary && (
                            <span className="text-gray-400 text-[11px] flex-shrink-0">
                              (Room {room.roomNumber})
                            </span>
                          )}
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400 font-mono text-[10px] border border-cyan-500/30 flex-shrink-0">
                          {room.floor === 0 ? 'Ground' : `Floor ${room.floor}`}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-gray-500">No rooms found matching "{endQuery}"</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dedicated Swap Button */}
        <button
          type="button"
          onClick={handleSwap}
          title="Swap start & destination rooms"
          className="p-3 rounded-xl bg-[#131b2e] hover:bg-[#1c2742] active:scale-95 border border-gray-700/80 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-400 transition shadow-md flex items-center justify-center self-stretch flex-shrink-0"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 relative z-10">
        <button
          onClick={() => onCalculateRoute()}
          disabled={!selectedStartId || !selectedEndId}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
        >
          <Navigation className="w-4 h-4" />
          <span>Find Route</span>
        </button>

        {(selectedStartId || selectedEndId) && (
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2.5 bg-[#131b2e] hover:bg-[#1a2337] text-gray-300 text-xs font-medium rounded-xl border border-gray-700/80 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Route Presets */}
      <div className="pt-2 border-t border-gray-800/80 relative z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Quick Room Presets:</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.from, preset.to)}
              className="px-2.5 py-2 rounded-xl bg-[#131b2e] hover:bg-[#1c2742] border border-gray-700/60 hover:border-emerald-500/40 text-left text-xs transition shadow-sm group"
            >
              <div className="font-semibold text-gray-200 group-hover:text-emerald-300 truncate transition">
                {preset.label}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-0.5">{preset.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
