import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [measurementUnit, setMeasurementUnit] = useState<'imperial' | 'metric'>('imperial');
  const [defaultExportFormat, setDefaultExportFormat] = useState<'png' | 'pdf'>('png');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5]">
      {/* Top Header */}
      <header className="flex justify-between items-center h-20 px-10 w-full z-30 bg-[#FAF9F5] border-b border-[#E7E5E0] sticky top-0">
        <div>
          <h1 className="text-3xl font-serif-display font-medium text-[#171717]">Settings</h1>
        </div>
      </header>

      {/* Settings Form */}
      <div className="p-10 max-w-3xl space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-[#E7E5E0] space-y-6 shadow-2xs">
          <h3 className="font-bold text-sm text-[#171717] pb-3 border-b border-[#E7E5E0]">
            Preferences & Export Defaults
          </h3>

          <div className="space-y-5 text-xs">
            {/* Measurement Units */}
            <div className="flex items-center justify-between">
              <div>
                <strong className="block text-[#171717] font-bold">Measurement Format</strong>
                <span className="text-[#6B6B6B]">Default measurement unit for height, bust, waist, hips.</span>
              </div>
              <div className="flex bg-[#FAF9F5] p-1 border border-[#E7E5E0] rounded-xl">
                <button
                  onClick={() => setMeasurementUnit('imperial')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    measurementUnit === 'imperial'
                      ? 'bg-[#171717] text-white'
                      : 'text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  US (ft / in / lbs)
                </button>
                <button
                  onClick={() => setMeasurementUnit('metric')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    measurementUnit === 'metric'
                      ? 'bg-[#171717] text-white'
                      : 'text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  Metric (cm / kg)
                </button>
              </div>
            </div>

            {/* Default Export Format */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E7E5E0]">
              <div>
                <strong className="block text-[#171717] font-bold">Default Export Format</strong>
                <span className="text-[#6B6B6B]">Primary file format when downloading comcards.</span>
              </div>
              <div className="flex bg-[#FAF9F5] p-1 border border-[#E7E5E0] rounded-xl">
                <button
                  onClick={() => setDefaultExportFormat('png')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    defaultExportFormat === 'png'
                      ? 'bg-[#171717] text-white'
                      : 'text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  PNG Image
                </button>
                <button
                  onClick={() => setDefaultExportFormat('pdf')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    defaultExportFormat === 'pdf'
                      ? 'bg-[#171717] text-white'
                      : 'text-[#6B6B6B] hover:text-[#171717]'
                  }`}
                >
                  PDF Document
                </button>
              </div>
            </div>

            {/* Auto Save Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E7E5E0]">
              <div>
                <strong className="block text-[#171717] font-bold">Auto-Save Drafts</strong>
                <span className="text-[#6B6B6B]">Automatically persist changes as you edit.</span>
              </div>
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#171717] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E5E0] flex justify-end">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Settings Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
