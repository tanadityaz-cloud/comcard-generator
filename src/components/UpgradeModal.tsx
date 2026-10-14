import React from 'react';
import { X, Award, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col relative border border-[#C8E6C9]">
        {/* Decorative Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 text-white p-8 relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-widest mb-2">
            <Award className="w-4 h-4" /> 100% Free & Open Access
          </div>
          <h2 className="text-3xl font-serif-display font-semibold mb-2">
            Completely Free Professional Comcard Creator
          </h2>
          <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
            Enjoy full, unrestricted access to all editorial templates, agency brand kit, high-resolution 300 DPI exports, and photo cropping tools — with zero subscription fees!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 bg-white">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Semua Fitur Tersedia 100% Gratis Tanpa Biaya (100% Free Application)</span>
          </div>

          {/* Feature List */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0]">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <strong className="block text-[#171717] font-semibold mb-0.5">Editorial Templates</strong>
                <span className="text-[#6B6B6B] text-[11px]">Classic, Editorial & Minimalist layouts included for free.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0]">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <strong className="block text-[#171717] font-semibold mb-0.5">Custom Agency Brand Kit</strong>
                <span className="text-[#6B6B6B] text-[11px]">Customize agency name, colors, and watermark logos.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0]">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <strong className="block text-[#171717] font-semibold mb-0.5">300 DPI Vector PDF Exports</strong>
                <span className="text-[#6B6B6B] text-[11px]">High-resolution print & digital downloads in PNG, JPG, or PDF.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0]">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div>
                <strong className="block text-[#171717] font-semibold mb-0.5">Unlimited Comcards</strong>
                <span className="text-[#6B6B6B] text-[11px]">Create, duplicate, edit & manage as many talent cards as you need.</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Start Using All Features Now (Free)
            </button>
            <span className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> No credit card required. Always 100% free.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
