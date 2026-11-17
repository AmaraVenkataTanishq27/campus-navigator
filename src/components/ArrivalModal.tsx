import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, MapPin, ArrowRight } from 'lucide-react';
import { RouteResult } from '../types/navigation';

interface ArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeResult: RouteResult;
  destLabel: string;
}

export const ArrivalModal: React.FC<ArrivalModalProps> = ({
  isOpen,
  onClose,
  routeResult,
  destLabel
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback if confetti isn't supported in environment
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0d121f] border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl shadow-emerald-500/10">
        {/* Trophy Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-gray-950 shadow-lg shadow-emerald-500/30">
          <Trophy className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">You Have Arrived!</h3>
        <p className="text-sm text-emerald-400 font-medium mb-4 flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4" />
          <span>{destLabel}</span>
        </p>

        {/* Route Stats Card */}
        <div className="bg-[#131b2e] rounded-xl p-4 mb-6 border border-gray-700/60 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-400">Total Distance</div>
            <div className="text-sm font-bold text-white">{routeResult.totalDistance} m</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Walk Time</div>
            <div className="text-sm font-bold text-white">~{routeResult.estimatedMinutes} min</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Floors</div>
            <div className="text-sm font-bold text-emerald-400">{routeResult.floorsTraversed.length}</div>
          </div>
        </div>

        {/* Close / Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
        >
          <span>Done & Start New Route</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
