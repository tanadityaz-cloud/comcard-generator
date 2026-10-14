import React, { useState } from 'react';
import { Sparkles, Upload, Check, ShieldCheck, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { OrlandLogo } from './OrlandLogo';
import { removeWhiteBackground } from '../lib/imageUtils';

interface BrandKitViewProps {
  onOpenUpgrade: () => void;
}

export const BrandKitView: React.FC<BrandKitViewProps> = ({ onOpenUpgrade }) => {
  const [agencyName, setAgencyName] = useState('ORLAND MANAGEMENT');
  const [accentColor, setAccentColor] = useState('#D4A737');
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawUrl = event.target?.result as string;
        // Automatically make background transparent
        const transparentUrl = await removeWhiteBackground(rawUrl);
        setCustomLogoUrl(transparentUrl);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5]">
      {/* Top Header */}
      <header className="flex justify-between items-center h-20 px-10 w-full z-30 bg-[#FAF9F5] border-b border-[#E7E5E0] sticky top-0">
        <div>
          <h1 className="text-3xl font-serif-display font-medium text-[#171717]">
            Agency Brand Kit Orland
          </h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs">
          <Check className="w-4 h-4 text-emerald-300" /> 100% Free Unlocked
        </div>
      </header>

      {/* Main Content */}
      <div className="p-10 max-w-4xl space-y-8">
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          Manage agency branding for <strong>Orland Management</strong>. Watermarks, transparent vector logos, and custom color accents are synced across all talent comcards automatically.
        </p>

        {/* Agency Logo Preview Box */}
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5E0] space-y-6 shadow-2xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A227]" /> Orland Management Official Transparent Logo
            </h3>
            {customLogoUrl && (
              <button
                onClick={() => setCustomLogoUrl(null)}
                className="text-xs text-[#6B6B6B] hover:text-[#171717] flex items-center gap-1 underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset to Default
              </button>
            )}
          </div>

          <div className="p-8 bg-[#FAF9F5] border border-[#E7E5E0] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[180px]">
            {/* Checkerboard subtle pattern to highlight background transparency */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(#171717 0.75px, transparent 0.75px), radial-gradient(#171717 0.75px, #FAF9F5 0.75px)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 8px 8px',
              }}
            />

            {customLogoUrl ? (
              <img
                src={customLogoUrl}
                alt="Custom Transparent Agency Logo"
                className="max-h-32 object-contain relative z-10 drop-shadow-md"
              />
            ) : (
              <div className="w-72 relative z-10">
                <OrlandLogo width="100%" height="auto" />
              </div>
            )}
            <span className="text-[11px] font-semibold text-[#6B6B6B] mt-3 relative z-10 bg-white/80 px-3 py-1 rounded-full border border-[#E7E5E0]">
              ✨ 100% Transparent Background
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="block text-[#6B6B6B] font-medium mb-1">Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl focus:border-[#171717] focus:outline-none bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-[#6B6B6B] font-medium mb-1">Brand Accent Gold</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-[#E7E5E0] rounded-xl uppercase font-mono focus:border-[#171717] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Custom Logo Upload with Auto White-Background Removal */}
          <div className="pt-4 border-t border-[#E7E5E0]">
            <label className="block text-xs font-semibold text-[#171717] mb-2">
              Upload Custom Logo (Auto Background Removal)
            </label>
            <label className="p-6 border-2 border-dashed border-[#E7E5E0] rounded-2xl bg-[#FAF9F5] hover:border-[#171717] transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-[#6B6B6B] group-hover:text-[#171717] mb-2 transition-colors" />
              <p className="text-xs font-semibold text-[#171717] mb-1">
                {isProcessing ? 'Processing Transparency...' : 'Upload PNG, JPG or SVG Logo'}
              </p>
              <p className="text-[11px] text-[#6B6B6B]">
                White backgrounds are automatically removed to make your logo 100% transparent.
              </p>
            </label>
          </div>
        </div>

        {/* Free App Callout */}
        <div className="bg-[#E8F5E9] p-6 rounded-2xl border border-[#C8E6C9] flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-emerald-950 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" /> Agency Brand Kit Orland is 100% Free
            </h4>
            <p className="text-xs text-emerald-800">
              Apply Orland watermarks, logos, and agency colors to all your talent comcards with zero restrictions.
            </p>
          </div>
          <button
            onClick={onOpenUpgrade}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};
