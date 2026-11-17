import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Navigation, MapPin, Sparkles } from 'lucide-react';
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
    onSelectStart(tempEnd);
    onSelectEnd(tempStart);
    if (tempEnd && tempStart) {
      onCalculateRoute(tempEnd, tempStart);
    }
  };

  const startNode = selectedStartId ? graph.nodes[selectedStartId] : null;
  const endNode = selectedEndId ? graph.nodes[selectedEndId] : null;

  // Preset quick navigation pairs across floors using valid graph node IDs
  const presets = [
    { label: 'AB 501 → AB 603', from: 'R_AB_501', to: 'R_AB_603', desc: 'Floor 5 to 6' },
    { label: 'AB 601 → AB 702', from: 'R_AB_601', to: 'R_AB_702', desc: 'Floor 6 to 7' },
    { label: 'AB 502 → AB 504', from: 'R_AB_502', to: 'R_AB_504', desc: 'Same Floor (5)' },
    { label: 'AB 701 → AB 503', from: 'R_AB_701', to: 'R_AB_503', desc: 'Floor 7 to 5' }
  ];

  const handleSelectPreset = (from: string, to: string) => {
    onSelectStart(from);
    onSelectEnd(to);
    onCalculateRoute(from, to);
  };

  return (
    <div className="relative bg-[#0d121f] border-b border-gray-800/80 p-4 space-y-3 z-30">
      {/* Invisible backdrop to dismiss dropdown when clicked outside */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      {/* Floor Filter Tabs for Room Selection */}
      <div className="flex items-center justify-between text-xs pb-1 relative z-30">
        <span className="text-gray-400 font-medium">Filter Rooms by Floor:</span>
        <div className="flex items-center gap-1 bg-[#131b2e] p-0.5 rounded-lg border border-gray-700/60">
          {(['all', 5, 6, 7] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterFloor(f)}
              className={`px-2.5 py-0.5 rounded font-medium text-xs transition ${
                filterFloor === f
                  ? 'bg-emerald-500 text-gray-950 font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {f === 'all' ? 'All' : `F${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Start and End Inputs */}
      <div className="relative space-y-2.5 z-30">
        {/* Start Room Input */}
        <div className="relative">
          <div className="flex items-center bg-[#131b2e] border border-gray-700/80 rounded-xl px-3 py-2.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/30 transition shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-2 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
            <input
              type="text"
              placeholder="Start: Type room no (e.g. 501, 601)..."
              value={startNode ? `${startNode.label} (Floor ${startNode.floor})` : startQuery}
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
              className="bg-transparent text-sm text-white placeholder-gray-500 w-full focus:outline-none"
            />
            {startNode && (
              <button
                onClick={() => {
                  onSelectStart(null);
                  setStartQuery('');
                }}
                title="Clear starting room"
                className="text-xs text-gray-400 hover:text-gray-100 ml-1 px-1.5 py-0.5 rounded bg-gray-700/80"
              >
                ✕
              </button>
            )}
          </div>

          {/* Start Dropdown */}
          {activeDropdown === 'start' && !startNode && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#131b2e] border border-gray-700/90 rounded-xl shadow-2xl z-50 divide-y divide-gray-800">
              {filteredStartRooms.length > 0 ? (
                filteredStartRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      onSelectStart(room.id);
                      setStartQuery('');
                      setActiveDropdown(null);
                      if (selectedEndId) {
                        onCalculateRoute(room.id, selectedEndId);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1f2940] flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-white">{room.label}</span>
                      <span className="text-gray-400 ml-2">Room {room.roomNumber}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-gray-800 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                      Floor {room.floor}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-gray-500">No rooms found matching "{startQuery}"</div>
              )}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="absolute right-3 top-[28px] z-30">
          <button
            onClick={handleSwap}
            title="Swap start & destination"
            className="p-1.5 rounded-full bg-gray-800/90 border border-gray-600 text-gray-300 hover:text-white hover:bg-emerald-600 transition shadow"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Room Input */}
        <div className="relative">
          <div className="flex items-center bg-[#131b2e] border border-gray-700/80 rounded-xl px-3 py-2.5 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/30 transition shadow-inner">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Destination: Type room no (e.g. 603, 702)..."
              value={endNode ? `${endNode.label} (Floor ${endNode.floor})` : endQuery}
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
              className="bg-transparent text-sm text-white placeholder-gray-500 w-full focus:outline-none"
            />
            {endNode && (
              <button
                onClick={() => {
                  onSelectEnd(null);
                  setEndQuery('');
                }}
                title="Clear destination room"
                className="text-xs text-gray-400 hover:text-gray-100 ml-1 px-1.5 py-0.5 rounded bg-gray-700/80"
              >
                ✕
              </button>
            )}
          </div>

          {/* Destination Dropdown */}
          {activeDropdown === 'end' && !endNode && (
            <div className="absolute top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-[#131b2e] border border-gray-700/90 rounded-xl shadow-2xl z-50 divide-y divide-gray-800">
              {filteredEndRooms.length > 0 ? (
                filteredEndRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      onSelectEnd(room.id);
                      setEndQuery('');
                      setActiveDropdown(null);
                      if (selectedStartId) {
                        onCalculateRoute(selectedStartId, room.id);
                      }
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-[#1f2940] flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-white">{room.label}</span>
                      <span className="text-gray-400 ml-2">Room {room.roomNumber}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-gray-800 text-cyan-400 font-mono text-[10px] border border-cyan-500/30">
                      Floor {room.floor}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-gray-500">No rooms found matching "{endQuery}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 relative z-30">
        <button
          onClick={() => onCalculateRoute()}
          disabled={!selectedStartId || !selectedEndId}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
        >
          <Navigation className="w-4 h-4" />
          <span>Find Route</span>
        </button>

        {(selectedStartId || selectedEndId) && (
          <button
            onClick={onClearRoute}
            className="px-3.5 py-2.5 bg-[#131b2e] hover:bg-[#1a2337] text-gray-300 text-xs font-medium rounded-xl border border-gray-700/80 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Quick Route Presets */}
      <div className="pt-2 border-t border-gray-800/80 relative z-30">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold uppercase tracking-wider text-[10px]">Quick Room Presets:</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.from, preset.to)}
              className="px-2.5 py-2 rounded-xl bg-[#131b2e]/90 hover:bg-[#1c2742] border border-gray-700/60 hover:border-emerald-500/40 text-left text-xs transition shadow-sm group"
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
