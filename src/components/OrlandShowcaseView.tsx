import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  Mail,
  Phone,
  Instagram,
  Globe,
  Sliders,
  Eye,
  Check,
  Calendar,
  Send,
  X,
  CloudUpload,
} from 'lucide-react';
import { Comcard } from '../types';
import { OrlandLogo } from './OrlandLogo';
import { ComcardCardRenderer } from './ComcardCardRenderer';

interface OrlandShowcaseViewProps {
  comcards: Comcard[];
  onEditComcard: (card: Comcard) => void;
  onOpenExport: (card: Comcard) => void;
  onCreateNew: () => void;
}

export const OrlandShowcaseView: React.FC<OrlandShowcaseViewProps> = ({
  comcards,
  onEditComcard,
  onOpenExport,
  onCreateNew,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewCard, setPreviewCard] = useState<Comcard | null>(null);
  const [bookingModel, setBookingModel] = useState<Comcard | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [projectType, setProjectType] = useState('Campaign Shoot');
  const [projectDate, setProjectDate] = useState('');
  const [message, setMessage] = useState('');

  const categories = [
    { id: 'all', label: 'All Roster' },
    { id: 'high-fashion', label: 'High Fashion & Runway' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'commercial', label: 'Commercial' },
  ];

  const filteredModels = comcards.filter((card) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'high-fashion') {
      return card.templateId === 'vogue_haute' || card.templateId === 'editorial';
    }
    if (selectedCategory === 'editorial') {
      return card.templateId === 'editorial' || card.templateId === 'cinema_film';
    }
    if (selectedCategory === 'commercial') {
      return card.templateId === 'classic' || card.templateId === 'runway_bold';
    }
    return true;
  });

  const handleSendBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModel(null);
      setClientName('');
      setClientEmail('');
      setClientCompany('');
      setMessage('');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5]">
      {/* Top Luxury Agency Header */}
      <header className="flex justify-between items-center h-20 px-8 lg:px-12 w-full z-30 bg-[#FAF9F5] border-b border-[#E7E5E0] sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-44 h-8 flex items-center">
            <OrlandLogo width="100%" height="auto" />
          </div>
          <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-[0.25em] text-[#A38220] border-l border-[#E7E5E0] pl-3">
            Official Agency Showcase
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-[#E7E5E0] rounded-full text-[#6B6B6B] font-mono">
            PARIS • MILAN • JAKARTA • TOKYO
          </span>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-[#171717] hover:bg-black text-white rounded-xl font-medium transition-all shadow-xs"
          >
            + Add New Talent
          </button>
        </div>
      </header>

      {/* Hero Showcase Banner */}
      <div className="relative bg-[#111111] text-white px-8 lg:px-12 py-14 overflow-hidden border-b border-[#C9A227]/30">
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#C9A227 1px, transparent 1px), radial-gradient(#C9A227 1px, #111111 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A737]/20 border border-[#D4A737]/40 text-[#E6B83B] text-[11px] font-mono tracking-widest uppercase">
              <Sparkles className="w-3 h-3" /> Exclusive Talent Roster
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif-display font-medium tracking-tight text-white">
              Orland Management Portfolio
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed font-light">
              Official agency representation for international runway, haute couture, luxury editorial, and high-impact commercial campaigns. Browse our signed talent roster, view certified composite cards, and export directly to Google Drive.
            </p>
          </div>

          {/* Agency Metric Badges */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto font-mono text-xs shrink-0">
            <div className="bg-[#1C1C1F] border border-[#C9A227]/30 p-3 rounded-xl">
              <div className="text-[#E6B83B] text-xl font-bold font-serif-display">{comcards.length}</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Signed Models</div>
            </div>
            <div className="bg-[#1C1C1F] border border-[#C9A227]/30 p-3 rounded-xl">
              <div className="text-[#E6B83B] text-xl font-bold font-serif-display">120+</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Runway Shows</div>
            </div>
            <div className="bg-[#1C1C1F] border border-[#C9A227]/30 p-3 rounded-xl">
              <div className="text-[#E6B83B] text-xl font-bold font-serif-display">380+</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Campaigns</div>
            </div>
            <div className="bg-[#1C1C1F] border border-[#C9A227]/30 p-3 rounded-xl">
              <div className="text-[#E6B83B] text-xl font-bold font-serif-display">4</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Global Hubs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Talent Roster Section */}
      <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-8 flex-1">
        {/* Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7E5E0] pb-4">
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#171717] text-white font-semibold shadow-xs'
                    : 'bg-white border border-[#E7E5E0] text-[#6B6B6B] hover:text-[#171717] hover:border-[#171717]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-[#6B6B6B]">
            Showing <strong className="text-[#171717]">{filteredModels.length}</strong> Talent Profiles
          </div>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className="group bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#171717] transition-all duration-300 flex flex-col"
            >
              {/* Image Container with Quick Preview Hover */}
              <div className="relative aspect-[3/4] bg-[#FAF9F5] overflow-hidden">
                <img
                  src={model.photos.main.url}
                  alt={model.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end">
                    <span className="bg-[#D4A737] text-black text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                      ORLAND TALENT
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setPreviewCard(model)}
                      className="w-full bg-white/90 hover:bg-white text-[#171717] text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 backdrop-blur-xs shadow-md"
                    >
                      <Eye className="w-3.5 h-3.5" /> Quick View Comcard
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onEditComcard(model)}
                        className="bg-black/80 hover:bg-black text-white text-xs font-medium py-2 rounded-xl flex items-center justify-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5" /> Edit Studio
                      </button>
                      <button
                        onClick={() => onOpenExport(model)}
                        className="bg-[#D4A737] hover:bg-[#C9A227] text-black text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1"
                      >
                        <CloudUpload className="w-3.5 h-3.5" /> Export / Drive
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Info */}
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-serif-display text-lg font-bold text-[#171717] tracking-tight">
                      {model.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#6B6B6B] uppercase">
                      {model.nationality || 'Model'}
                    </span>
                  </div>

                  {/* Measurement Chips */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono bg-[#FAF9F5] p-2 rounded-lg border border-[#E7E5E0] my-3">
                    <div>
                      <span className="text-[#888888] block text-[8px]">HEIGHT</span>
                      <span className="font-semibold text-[#171717]">{model.stats.height.split('/')[0]}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[8px]">WAIST</span>
                      <span className="font-semibold text-[#171717]">{model.stats.waist.split('/')[0]}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[8px]">SHOES</span>
                      <span className="font-semibold text-[#171717]">{model.stats.shoeSize.split('/')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Button */}
                <button
                  onClick={() => setBookingModel(model)}
                  className="w-full mt-2 py-2 border border-[#171717] text-[#171717] hover:bg-[#171717] hover:text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Talent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Quick Preview Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E7E5E0]">
              <div className="flex items-center gap-2">
                <OrlandLogo width={120} height="auto" />
                <span className="text-xs font-mono font-bold text-[#6B6B6B] pl-2 border-l border-[#E7E5E0]">
                  {previewCard.name} Official Comcard
                </span>
              </div>
              <button
                onClick={() => setPreviewCard(null)}
                className="p-1 rounded-full text-[#6B6B6B] hover:bg-[#FAF9F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-[#FAF9F5]">
              <div className="w-[440px] shadow-2xl rounded-xs overflow-hidden">
                <ComcardCardRenderer comcard={previewCard} />
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-[#E7E5E0] flex justify-between items-center">
              <button
                onClick={() => {
                  onEditComcard(previewCard);
                  setPreviewCard(null);
                }}
                className="px-4 py-2 border border-[#E7E5E0] hover:border-[#171717] rounded-xl text-xs font-medium text-[#171717]"
              >
                Open in Full Editor
              </button>
              <button
                onClick={() => {
                  onOpenExport(previewCard);
                  setPreviewCard(null);
                }}
                className="px-5 py-2.5 bg-[#171717] text-white hover:bg-black rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs"
              >
                <CloudUpload className="w-4 h-4 text-[#D4A737]" /> Export & Save to Google Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Inquiry Modal */}
      {bookingModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E7E5E0]">
              <div>
                <h3 className="font-bold text-lg text-[#171717]">Book Talent</h3>
                <p className="text-xs text-[#6B6B6B]">
                  Inquiry for <strong>{bookingModel.name}</strong> via Orland Management
                </p>
              </div>
              <button
                onClick={() => setBookingModel(null)}
                className="p-1 rounded-full text-[#6B6B6B] hover:bg-[#FAF9F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-10 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-[#171717]">Booking Request Submitted!</h4>
                <p className="text-xs text-[#6B6B6B] max-w-sm">
                  Orland Management booking desk has received your request for {bookingModel.name}. Our agent will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendBooking} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Jean Dupont"
                      className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="casting@agency.com"
                      className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Company / Brand</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="Vogue / Harper's Bazaar"
                      className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#171717] mb-1">Project Type</label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none bg-white"
                    >
                      <option>Fashion Week Runway</option>
                      <option>Campaign Shoot</option>
                      <option>Magazine Editorial</option>
                      <option>Commercial TVC</option>
                      <option>Lookbook</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Shoot Date / Timeline</label>
                  <input
                    type="date"
                    value={projectDate}
                    onChange={(e) => setProjectDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171717] mb-1">Project Details & Notes</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the location, usage rights, and call time..."
                    className="w-full px-3 py-2 border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingModel(null)}
                    className="px-4 py-2 border border-[#E7E5E0] rounded-xl text-xs font-medium text-[#6B6B6B] hover:text-[#171717]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
