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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1120] border border-[#00F0FF]/40 rounded-3xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(0,240,255,0.25)]">
        {/* Trophy Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-[#00F0FF] via-[#06B6D4] to-[#FF007F] flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.6)]">
          <Trophy className="w-8 h-8 stroke-[2.4]" />
        </div>

        <h3 className="text-xl font-extrabold text-white mb-1 tracking-tight">Destination Reached!</h3>
        <p className="text-sm text-[#00F0FF] font-extrabold mb-5 flex items-center justify-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#FF007F] stroke-[2.2] drop-shadow-[0_0_6px_#FF007F]" />
          <span>{destLabel}</span>
        </p>

        {/* Route Stats Card */}
        <div className="bg-[#070B14] border border-[#1E293B] rounded-2xl p-4 mb-6 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance</div>
            <div className="text-base font-black text-white">{routeResult.totalDistance} m</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</div>
            <div className="text-base font-black text-white">~{routeResult.estimatedMinutes} min</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Floors</div>
            <div className="text-base font-black text-[#00F0FF]">{routeResult.floorsTraversed.length}</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 sharp-btn-royal font-black text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg text-slate-950"
        >
          <span>COMPLETE & START NEW ROUTE</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
