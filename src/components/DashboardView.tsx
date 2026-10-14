import React, { useState } from 'react';
import { Search, Bell, Plus, ArrowRight, MoreHorizontal, Crown, HardDrive, Sparkles } from 'lucide-react';
import { Comcard } from '../types';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  comcards: Comcard[];
  onCreateNew: () => void;
  onEditComcard: (card: Comcard) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  comcards,
  onCreateNew,
  onEditComcard,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredComcards = comcards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.contact.agency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentCard = comcards[0];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5]">
      {/* Top Bar Header */}
      <header className="flex justify-between items-center h-20 px-10 w-full z-30 bg-[#FAF9F5] border-b border-[#E7E5E0] sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-serif-display font-medium text-[#171717]">
            Good afternoon 👋
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search comcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E5E0] rounded-full text-xs focus:border-[#171717] focus:outline-none transition-colors"
            />
          </div>

          {/* Notification Button */}
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-[#E7E5E0] bg-white hover:bg-[#FAF9F5] text-[#6B6B6B] transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#E3E2DF] overflow-hidden border border-[#E7E5E0] shadow-2xs">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="px-10 py-8 flex-1">
        {/* Orland Agency & Drive Highlights */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] text-white p-6 rounded-2xl border border-[#C9A227]/40 shadow-sm flex justify-between items-center relative overflow-hidden">
            <div className="z-10 space-y-2 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D4A737]/20 border border-[#D4A737]/30 text-[#E6B83B] text-[10px] font-mono uppercase tracking-widest">
                <Crown className="w-3 h-3" /> Agency Showcase
              </span>
              <h3 className="font-serif-display text-lg font-bold">Orland Management Roster</h3>
              <p className="text-xs text-zinc-300">
                Official talent agency showcase with international stats, editorial covers, and direct booking inquiries.
              </p>
              <button
                onClick={() => onNavigateTab('orland-showcase')}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#D4A737] hover:underline"
              >
                View Talent Showcase <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <Crown className="w-20 h-20 text-[#D4A737]/10 absolute -right-2 -bottom-2 pointer-events-none" />
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E7E5E0] shadow-2xs flex justify-between items-center relative overflow-hidden">
            <div className="z-10 space-y-2 max-w-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono uppercase tracking-widest">
                <HardDrive className="w-3 h-3 text-[#C9A227]" /> Google Drive Connected
              </span>
              <h3 className="font-serif-display text-lg font-bold text-[#171717]">Cloud Backup Center</h3>
              <p className="text-xs text-[#6B6B6B]">
                Comcard PDFs, high-res model photos, and JSON backups synced automatically in your Google Drive.
              </p>
              <button
                onClick={() => onNavigateTab('google-drive')}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] hover:underline"
              >
                Manage Drive Files <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <HardDrive className="w-20 h-20 text-[#171717]/5 absolute -right-2 -bottom-2 pointer-events-none" />
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Action 1: Create New Comcard */}
            <button
              onClick={onCreateNew}
              className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-[#E7E5E0] rounded-2xl hover:border-[#171717] hover:bg-[#FFFFFF] transition-all h-48 shadow-2xs cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#FAF9F5] flex items-center justify-center text-[#6B6B6B] group-hover:text-[#171717] group-hover:bg-[#171717]/10 transition-colors mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold text-base text-[#171717]">Create New Comcard</span>
              <span className="text-xs text-[#6B6B6B] mt-1">Start from scratch or a template</span>
            </button>

            {/* Action 2: Recent Activity */}
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 h-48 flex flex-col justify-between shadow-2xs">
              <div>
                <h3 className="font-bold text-base text-[#171717] mb-1">Recent Activity</h3>
                <p className="text-xs text-[#6B6B6B]">
                  {recentCard ? `You edited '${recentCard.name}' recently.` : 'No recent edits yet.'}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('my-comcards')}
                className="flex items-center gap-1.5 text-[#171717] hover:underline text-xs font-semibold self-start"
              >
                View History <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Action 3: Curated Templates */}
            <div className="bg-white border border-[#E7E5E0] rounded-2xl p-6 h-48 flex flex-col justify-between relative overflow-hidden shadow-2xs">
              <div className="z-10 relative">
                <h3 className="font-bold text-base text-[#171717] mb-1">Editorial Templates</h3>
                <p className="text-xs text-[#6B6B6B]">Explore high-fashion editorial layouts — 100% free.</p>
              </div>
              <div className="z-10 relative">
                <button
                  onClick={() => onNavigateTab('templates')}
                  className="text-[#C9A227] font-semibold text-xs hover:underline flex items-center gap-1"
                >
                  Browse Library <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Decorative Accent */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#FAF9F5] rounded-full opacity-60 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Recent Comcards Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-[#171717]">Recent Comcards</h2>
            <button
              onClick={() => onNavigateTab('my-comcards')}
              className="text-xs text-[#171717] font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredComcards.slice(0, 3).map((card) => (
              <div
                key={card.id}
                className="group relative bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-[3/4] bg-[#FAF9F5] relative p-3 flex flex-col overflow-hidden">
                  {/* Miniature Comcard Card Representation */}
                  <div className="flex-1 bg-white border border-[#E7E5E0] shadow-2xs flex flex-col p-2 relative overflow-hidden rounded-xs">
                    <img
                      src={card.photos.main.url}
                      alt={card.name}
                      className="w-full h-1/2 object-cover mb-2 rounded-2xs"
                    />
                    <div className="grid grid-cols-3 gap-1 h-1/4">
                      <img
                        src={card.photos.grid1.url}
                        alt="Thumb 1"
                        className="w-full h-full object-cover rounded-2xs"
                      />
                      <img
                        src={card.photos.grid2.url}
                        alt="Thumb 2"
                        className="w-full h-full object-cover rounded-2xs"
                      />
                      <img
                        src={card.photos.grid3.url}
                        alt="Thumb 3"
                        className="w-full h-full object-cover rounded-2xs"
                      />
                    </div>
                    <div className="mt-2 h-2 bg-[#E3E2DF] w-1/2 rounded" />
                  </div>

                  {/* Hover Edit Action Overlay */}
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-2xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <button
                      onClick={() => onEditComcard(card)}
                      className="bg-[#171717] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md hover:bg-black transition-colors"
                    >
                      Edit Card
                    </button>
                  </div>
                </div>

                <div className="p-4 border-t border-[#E7E5E0] flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-[#171717] truncate">{card.name}</h3>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                      Updated {new Date(card.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onEditComcard(card)}
                    className="p-1 rounded text-[#6B6B6B] hover:text-[#171717]"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty Creation Placeholder Card */}
            <button
              onClick={onCreateNew}
              className="border-2 border-dashed border-[#E7E5E0] rounded-2xl bg-[#FAF9F5] flex flex-col items-center justify-center text-center p-6 hover:border-[#171717] transition-all cursor-pointer aspect-[3/4]"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-[#E7E5E0] flex items-center justify-center mb-3 text-[#6B6B6B]">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#171717] mb-1">Create More Comcards</p>
              <p className="text-[11px] text-[#6B6B6B]">Click to start a new model portfolio</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
