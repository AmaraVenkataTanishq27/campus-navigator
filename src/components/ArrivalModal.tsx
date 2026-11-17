import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, MapPin, ArrowRight } from 'lucide-react';
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
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl">
        {/* Trophy Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Trophy className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">You Have Arrived!</h3>
        <p className="text-sm text-blue-700 font-extrabold mb-5 flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4 text-orange-600 stroke-[2.2]" />
          <span>{destLabel}</span>
        </p>

        {/* Route Stats Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Total Distance</div>
            <div className="text-base font-black text-slate-900">{routeResult.totalDistance} m</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Walk Time</div>
            <div className="text-base font-black text-slate-900">~{routeResult.estimatedMinutes} min</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold uppercase">Floors</div>
            <div className="text-base font-black text-blue-700">{routeResult.floorsTraversed.length}</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 sharp-btn-royal font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-md"
        >
          <span>Done & Start New Route</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
