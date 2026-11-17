import React, { useState } from 'react';
import { QrCode, Copy, Check, Download, X } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'cyberpunk' | 'beige';
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  theme = 'cyberpunk'
}) => {
  const [copied, setCopied] = useState(false);
  const isCyber = theme === 'cyberpunk';
  const appUrl = 'https://amaravenkatatanishq27.github.io/campus-navigator/';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baseUrl = ((import.meta as any).env?.BASE_URL || './').replace(/\/$/, '');
  const qrImgSrc = `${baseUrl}/hurry-msrit-qr.png`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-3xl border p-6 flex flex-col items-center text-center shadow-2xl relative transition-all ${
          isCyber
            ? 'bg-[#0B1120] border-[#00F0FF]/40 text-white shadow-[0_0_50px_rgba(0,240,255,0.25)]'
            : 'bg-white border-slate-300 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition ${
            isCyber ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${
            isCyber
              ? 'bg-gradient-to-tr from-[#00F0FF] to-[#8B5CF6] text-slate-950 shadow-cyan-500/30'
              : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
          }`}
        >
          <QrCode className="w-6 h-6 stroke-[2.4]" />
        </div>

        <h3 className="text-lg font-black tracking-tight">Scan to Open App</h3>
        <p className={`text-xs mt-1 mb-4 font-medium ${isCyber ? 'text-slate-400' : 'text-slate-600'}`}>
          Point your phone camera at this QR code to navigate on your mobile device.
        </p>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-inner mb-4 flex items-center justify-center">
          <img
            src={qrImgSrc}
            alt="HURRY! MSRIT QR Code"
            className="w-48 h-48 object-contain rounded-lg"
          />
        </div>

        {/* Link Box */}
        <div
          className={`w-full px-3 py-2 rounded-xl text-xs font-mono truncate border mb-4 flex items-center justify-between gap-2 ${
            isCyber ? 'bg-[#070B14] border-[#1E293B] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <span className="truncate text-[11px]">{appUrl}</span>
          <button
            onClick={handleCopy}
            title="Copy URL"
            className={`p-1.5 rounded-lg flex-shrink-0 transition active:scale-95 ${
              isCyber
                ? 'hover:bg-slate-800 text-[#00F0FF]'
                : 'hover:bg-slate-200 text-blue-600'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
              copied
                ? 'bg-emerald-600 text-white'
                : isCyber
                ? 'sharp-btn-royal text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <a
            href={qrImgSrc}
            download="hurry-msrit-qr.png"
            className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 active:scale-95 ${
              isCyber
                ? 'bg-[#0F172A] hover:bg-[#1E293B] border-[#1E293B] text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save Image</span>
          </a>
        </div>
      </div>
    </div>
  );
};
