import React, { useState } from 'react';
import { Search, Filter, Plus, Edit3, Copy, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { Comcard } from '../types';

interface MyComcardsViewProps {
  comcards: Comcard[];
  onCreateNew: () => void;
  onEditComcard: (card: Comcard) => void;
  onDuplicateComcard: (card: Comcard) => void;
  onDeleteComcard: (cardId: string) => void;
}

export const MyComcardsView: React.FC<MyComcardsViewProps> = ({
  comcards,
  onCreateNew,
  onEditComcard,
  onDuplicateComcard,
  onDeleteComcard,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredComcards = comcards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.contact.agency.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'classic') return matchesSearch && card.templateId === 'classic';
    if (activeFilter === 'editorial') return matchesSearch && card.templateId === 'editorial';
    if (activeFilter === 'minimal') return matchesSearch && card.templateId === 'minimal';

    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5]">
      {/* Top App Bar */}
      <header className="flex justify-between items-center h-20 px-10 w-full z-30 bg-[#FAF9F5] border-b border-[#E7E5E0] sticky top-0">
        <h1 className="text-3xl font-serif-display font-medium text-[#171717]">My Comcards</h1>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search comcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E5E0] rounded-xl text-xs focus:border-[#171717] focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Dropdown Toggle */}
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border border-[#E7E5E0] rounded-xl bg-white text-xs font-semibold text-[#171717] cursor-pointer hover:bg-[#FAF9F5] focus:outline-none transition-colors appearance-none pr-8"
            >
              <option value="all">All Templates</option>
              <option value="classic">Classic Standard</option>
              <option value="editorial">Editorial</option>
              <option value="minimal">Minimalist</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] pointer-events-none" />
          </div>

          {/* New Comcard CTA Button */}
          <button
            onClick={onCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Comcard
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="p-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredComcards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-[#E7E5E0] rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative group"
            >
              {/* Photo Card Preview Container */}
              <div className="aspect-[3/4] relative bg-[#FAF9F5] overflow-hidden">
                <img
                  src={card.photos.main.url}
                  alt={card.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Overlay Hover Quick Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-2xs">
                  <button
                    onClick={() => onEditComcard(card)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-colors shadow-lg cursor-pointer"
                    title="Edit Comcard"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicateComcard(card)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#171717] hover:bg-[#171717] hover:text-white transition-colors shadow-lg cursor-pointer"
                    title="Duplicate Comcard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Bottom Meta */}
              <div className="p-4 flex justify-between items-start bg-white border-t border-[#E7E5E0]">
                <div>
                  <h3 className="font-bold text-sm text-[#171717] mb-0.5">{card.name}</h3>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Updated {new Date(card.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Kebab Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === card.id ? null : card.id)}
                    className="text-[#6B6B6B] hover:text-[#171717] p-1 rounded-lg hover:bg-[#FAF9F5] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openMenuId === card.id && (
                    <div className="absolute right-0 bottom-8 w-36 bg-white border border-[#E7E5E0] rounded-xl shadow-xl z-20 py-1 text-xs">
                      <button
                        onClick={() => {
                          onEditComcard(card);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#FAF9F5] flex items-center gap-2 text-[#171717]"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          onDuplicateComcard(card);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#FAF9F5] flex items-center gap-2 text-[#171717]"
                      >
                        <Copy className="w-3.5 h-3.5" /> Duplicate
                      </button>
                      <button
                        onClick={() => {
                          onDeleteComcard(card.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Draft New Card Button Slot */}
          <div
            onClick={onCreateNew}
            className="bg-white border-2 border-dashed border-[#E7E5E0] rounded-2xl overflow-hidden flex flex-col hover:border-[#171717] hover:bg-[#FAF9F5] transition-all duration-300 cursor-pointer group justify-center items-center h-[calc(100%-1px)] min-h-[380px]"
          >
            <div className="w-14 h-14 rounded-full bg-[#FAF9F5] flex items-center justify-center mb-4 group-hover:bg-[#171717] transition-colors">
              <ImageIcon className="w-6 h-6 text-[#6B6B6B] group-hover:text-white" />
            </div>
            <h3 className="font-bold text-sm text-[#171717] mb-1">Create New</h3>
            <p className="text-xs text-[#6B6B6B] text-center px-6">
              Start a blank comcard or choose a template.
            </p>
          </div>
        </div>

        {/* Load More Button */}
        <div className="mt-12 flex justify-center">
          <button className="px-6 py-2.5 border border-[#E7E5E0] rounded-full text-xs font-semibold text-[#6B6B6B] hover:text-[#171717] hover:border-[#171717] transition-colors bg-white shadow-2xs">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};
