import React, { useState } from 'react';
import {
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { googleSignIn, setPopupBlocked } from '../lib/firebaseAuth';

interface PopupBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PopupBlockedModal: React.FC<PopupBlockedModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRetrySignIn = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      // Direct click invocation allows browsers to open popup if permitted
      const res = await googleSignIn();
      if (res) {
        setPopupBlocked(false);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Retry sign in failed:', err);
      if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup-blocked')) {
        setRetryError('Pop-up masih terblokir. Silakan izinkan pop-up di bilah URL atau buka di Tab Baru.');
      } else {
        setRetryError(err.message || 'Gagal login. Silakan coba buka di Tab Baru.');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-amber-50/80 px-6 py-4 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#171717]">Pop-up Login Google Diblokir</h3>
              <p className="text-[11px] text-amber-900/80">Browser membatasi jendela otorisasi akun</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-amber-100/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-[#171717]">
          <p className="text-[#6B6B6B] leading-relaxed">
            Karena aplikasi berjalan di dalam panel pratinjau (iframe), fitur keamanan browser Anda secara otomatis mencegah jendela pop-up Google Sign-In terbuka.
          </p>

          {retryError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[11px] flex items-start gap-2">
              <span className="font-bold">Perhatian:</span>
              <span>{retryError}</span>
            </div>
          )}

          {/* Solution 1: Open in New Tab (Recommended) */}
          <div className="p-4 bg-[#FAF9F5] border border-[#E7E5E0] rounded-xl space-y-2.5 hover:border-[#C9A227]/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-[#171717]">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[11px] font-bold">1</span>
                Solusi Paling Mudah: Buka di Tab Baru
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Direkomendasikan
              </span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
              Buka aplikasi di tab browser mandiri. Di tab baru, seluruh pop-up Google OAuth dan sinkronisasi Google Drive berjalan lancar 100% tanpa hambatan iframe.
            </p>
            <button
              onClick={handleOpenInNewTab}
              className="w-full py-2.5 bg-[#171717] hover:bg-black text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D4A737]" />
              <span>Buka Aplikasi di Tab Baru</span>
            </button>
          </div>

          {/* Solution 2: Allow Popups in Current Browser */}
          <div className="p-4 bg-white border border-[#E7E5E0] rounded-xl space-y-2">
            <span className="font-bold text-xs flex items-center gap-1.5 text-[#171717]">
              <span className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-800 flex items-center justify-center text-[11px] font-bold">2</span>
              Atau Izinkan Pop-up di Bilah Browser
            </span>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-[#6B6B6B] pl-1">
              <li>
                Lihat pojok kanan atas bilah alamat (URL bar) browser Anda untuk ikon pop-up terblokir.
              </li>
              <li>
                Klik ikon tersebut dan pilih <strong>"Selalu izinkan pop-up dan pengalihan..."</strong> (Always allow pop-ups).
              </li>
              <li>
                Setelah diizinkan, klik tombol <strong>"Coba Buka Jendela Login Lagi"</strong> di bawah.
              </li>
            </ol>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#E7E5E0] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#E7E5E0] rounded-lg font-medium text-xs text-[#6B6B6B] hover:text-[#171717] hover:bg-white transition-colors"
          >
            Tutup
          </button>

          <button
            onClick={handleRetrySignIn}
            disabled={isRetrying}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Membuka Jendela...' : 'Coba Buka Jendela Login Lagi'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
