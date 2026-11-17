import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, MapPin, ArrowRight } from 'lucide-react';
import { RouteResult } from '../types/navigation';

interface ArrivalModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeResult?: RouteResult;
  destLabel: string;
  theme?: 'cyberpunk' | 'beige';
}

export const ArrivalModal: React.FC<ArrivalModalProps> = ({
  isOpen,
  onClose,
  destLabel,
  theme = 'cyberpunk'
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

  const isCyber = theme === 'cyberpunk';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
      isCyber ? 'bg-black/80' : 'bg-[#181614]/60'
    }`}>
      <div className={`rounded-3xl max-w-sm w-full p-6 text-center transition-all ${
        isCyber
          ? 'bg-[#0B1120] border border-[#00F0FF]/40 shadow-[0_0_50px_rgba(0,240,255,0.25)]'
          : 'bg-[#FAF8F5] border border-[#E7E2DA] shadow-2xl shadow-stone-900/20'
      }`}>
        {/* Trophy Icon */}
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          isCyber
            ? 'bg-gradient-to-tr from-[#00F0FF] via-[#06B6D4] to-[#FF007F] text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.6)]'
            : 'bg-gradient-to-tr from-[#1E40AF] to-[#2563EB] text-white shadow-lg shadow-blue-500/30'
        }`}>
          <Trophy className="w-8 h-8 stroke-[2.4]" />
        </div>

        <h3 className={`text-xl font-extrabold mb-1 tracking-tight ${
          isCyber ? 'text-white' : 'text-stone-900'
        }`}>
          Destination Reached!
        </h3>
        <p className={`text-sm font-extrabold mb-6 flex items-center justify-center gap-1.5 ${
          isCyber ? 'text-[#00F0FF]' : 'text-blue-700'
        }`}>
          <MapPin className={`w-4 h-4 stroke-[2.2] ${isCyber ? 'text-[#FF007F] drop-shadow-[0_0_6px_#FF007F]' : 'text-red-500'}`} />
          <span>{destLabel}</span>
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-3.5 px-4 font-black text-sm rounded-xl flex items-center justify-center gap-2 tracking-wide shadow-lg transition-transform active:scale-[0.98] ${
            isCyber
              ? 'sharp-btn-royal text-slate-950'
              : 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-blue-900/20'
          }`}
        >
          <span>COMPLETE & START NEW ROUTE</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
