import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MyComcardsView } from './components/MyComcardsView';
import { TemplatesView } from './components/TemplatesView';
import { EditorView } from './components/EditorView';
import { BrandKitView } from './components/BrandKitView';
import { SettingsView } from './components/SettingsView';
import { OrlandShowcaseView } from './components/OrlandShowcaseView';
import { DriveSyncView } from './components/DriveSyncView';
import { UpgradeModal } from './components/UpgradeModal';
import { ExportModal } from './components/ExportModal';
import { PopupBlockedModal } from './components/PopupBlockedModal';
import { subscribePopupBlocked } from './lib/firebaseAuth';
import { INITIAL_COMCARDS, PRESET_STOCK_PHOTOS } from './data/mockData';
import { Comcard, TemplateId } from './types';
import { Menu, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'comcard_generator_saved_cards';

export default function App() {
  // Load saved comcards from localStorage or fall back to INITIAL_COMCARDS
  const [comcards, setComcards] = useState<Comcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved comcards:', e);
    }
    return INITIAL_COMCARDS;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedComcard, setSelectedComcard] = useState<Comcard | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>('classic');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [exportCard, setExportCard] = useState<Comcard | null>(null);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);

  // Subscribe to popup blocked events across the app
  useEffect(() => {
    const unsubscribe = subscribePopupBlocked((blocked) => {
      setIsPopupBlocked(blocked);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Sync to local storage whenever comcards state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comcards));
    } catch (e) {
      console.warn('Could not save comcards to localStorage:', e);
    }
  }, [comcards]);

  // Handler: Create New Blank Comcard
  const handleCreateNew = () => {
    const newId = `card-${Date.now()}`;
    const newCard: Comcard = {
      id: newId,
      name: 'New Talent',
      displayName: 'NEW TALENT',
      age: '22',
      gender: 'Female',
      nationality: 'International',
      stats: {
        height: "5'10\" / 178 cm",
        weight: "120 lbs / 54 kg",
        bust: '34" / 86 cm',
        waist: '24" / 61 cm',
        hips: '35" / 89 cm',
        shoeSize: '8.5 US / 39 EU',
        clothingSize: '2-4 US / S',
        hair: 'Brown',
        eyes: 'Brown',
        skinTone: 'Fair',
      },
      contact: {
        phone: '+1 (555) 019-2831',
        email: 'talent@orlandmanagement.com',
        instagram: '@talent_official',
        website: 'www.orlandmanagement.com',
        agency: 'ORLAND MANAGEMENT',
      },
      visibleStats: {
        height: true,
        weight: true,
        bust: true,
        waist: true,
        hips: true,
        shoeSize: true,
        clothingSize: true,
        hair: true,
        eyes: true,
      },
      templateId: selectedTemplateId,
      accentColor: '#171717',
      experience: {
        showOnCard: true,
        headline: 'Selected Experience & Highlights',
        items: [
          'Jakarta Fashion Week 2024 (Runway)',
          'Vogue Editorial Shoot',
          'Brand Lookbook Campaign',
        ],
        bio: 'Professional model available for runway, editorial, and commercial bookings.',
      },
      photos: {
        main: {
          url: PRESET_STOCK_PHOTOS[0].url,
          zoom: 1,
          cropX: 0,
          cropY: 0,
        },
        grid1: {
          url: PRESET_STOCK_PHOTOS[3].url,
          zoom: 1,
          cropX: 0,
          cropY: 0,
        },
        grid2: {
          url: PRESET_STOCK_PHOTOS[4].url,
          zoom: 1,
          cropX: 0,
          cropY: 0,
        },
        grid3: {
          url: PRESET_STOCK_PHOTOS[5].url,
          zoom: 1,
          cropX: 0,
          cropY: 0,
        },
        grid4: {
          url: PRESET_STOCK_PHOTOS[6].url,
          zoom: 1,
          cropX: 0,
          cropY: 0,
        },
        grid5: {
          url: PRESET_STOCK_PHOTOS[1]?.url || PRESET_STOCK_PHOTOS[0].url,
          zoom: 1,
          cropX: 0,
          cropY: 0,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setComcards((prev) => [newCard, ...prev]);
    setSelectedComcard(newCard);
  };

  // Handler: Edit Comcard
  const handleEditComcard = (card: Comcard) => {
    setSelectedComcard(card);
  };

  // Handler: Duplicate Comcard
  const handleDuplicateComcard = (card: Comcard) => {
    const duplicated: Comcard = {
      ...card,
      id: `card-${Date.now()}`,
      name: `${card.name} (Copy)`,
      displayName: `${card.displayName} (COPY)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComcards((prev) => [duplicated, ...prev]);
  };

  // Handler: Delete Comcard
  const handleDeleteComcard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this Comcard?')) {
      setComcards((prev) => prev.filter((c) => c.id !== cardId));
      if (selectedComcard?.id === cardId) {
        setSelectedComcard(null);
      }
    }
  };

  // Handler: Update Comcard from Editor
  const handleUpdateComcard = (updatedCard: Comcard) => {
    setSelectedComcard(updatedCard);
    setComcards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  // Handler: Select Template from Templates View
  const handleSelectTemplateFromView = (templateId: TemplateId) => {
    setSelectedTemplateId(templateId);
    if (selectedComcard) {
      handleUpdateComcard({
        ...selectedComcard,
        templateId,
      });
    } else if (comcards.length > 0) {
      // Edit top card with new template
      handleEditComcard({
        ...comcards[0],
        templateId,
      });
    } else {
      handleCreateNew();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F5] text-[#1b1c1a]">
      {/* Mobile Top Bar Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2.5 bg-white border border-[#E7E5E0] rounded-xl shadow-md text-[#171717]"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={() => window.open(window.location.href, '_blank')}
          className="p-2.5 bg-white border border-[#E7E5E0] rounded-xl shadow-md text-[#6B6B6B] hover:text-[#171717]"
          title="Buka di Tab Baru (Disarankan untuk Login Google)"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedComcard(null); // Return to main tab screens
        }}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="lg:ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        {selectedComcard ? (
          /* Editor Mode */
          <EditorView
            comcard={selectedComcard}
            onUpdateComcard={handleUpdateComcard}
            onBack={() => setSelectedComcard(null)}
          />
        ) : (
          /* Tab Screen Views */
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                comcards={comcards}
                onCreateNew={handleCreateNew}
                onEditComcard={handleEditComcard}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'orland-showcase' && (
              <OrlandShowcaseView
                comcards={comcards}
                onEditComcard={handleEditComcard}
                onOpenExport={(card) => setExportCard(card)}
                onCreateNew={handleCreateNew}
              />
            )}

            {currentTab === 'my-comcards' && (
              <MyComcardsView
                comcards={comcards}
                onCreateNew={handleCreateNew}
                onEditComcard={handleEditComcard}
                onDuplicateComcard={handleDuplicateComcard}
                onDeleteComcard={handleDeleteComcard}
              />
            )}

            {currentTab === 'templates' && (
              <TemplatesView
                selectedTemplateId={selectedTemplateId}
                onSelectTemplate={handleSelectTemplateFromView}
                onOpenExport={() => setExportCard(comcards[0] || null)}
              />
            )}

            {currentTab === 'google-drive' && (
              <DriveSyncView comcards={comcards} />
            )}

            {currentTab === 'brand-kit' && (
              <BrandKitView onOpenUpgrade={() => setIsUpgradeModalOpen(true)} />
            )}

            {currentTab === 'settings' && <SettingsView />}
          </>
        )}
      </main>

      {/* Global Modals */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />

      {exportCard && (
        <ExportModal
          isOpen={!!exportCard}
          comcard={exportCard}
          onClose={() => setExportCard(null)}
        />
      )}

      {/* Pop-up Blocked Guide Modal */}
      <PopupBlockedModal
        isOpen={isPopupBlocked}
        onClose={() => setIsPopupBlocked(false)}
        onSuccess={() => setIsPopupBlocked(false)}
      />
    </div>
  );
}
