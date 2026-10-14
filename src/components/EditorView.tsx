import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  Download,
  RotateCcw,
  Crop,
  Upload,
  User,
  Image as ImageIcon,
  Layout,
  Eye,
  EyeOff,
  Sparkles,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HardDrive,
  Cloud,
  CheckCircle2,
  Briefcase,
  Plus,
  Trash2,
} from 'lucide-react';
import { Comcard, PhotoItem, TemplateId } from '../types';
import { TEMPLATES } from '../data/mockData';
import { ComcardCardRenderer } from './ComcardCardRenderer';
import { PhotoCropModal } from './PhotoCropModal';
import { ExportModal } from './ExportModal';
import { PRESET_STOCK_PHOTOS } from '../data/mockData';
import { getAccessToken, googleSignIn } from '../lib/firebaseAuth';
import { saveComcardsDatabaseToDrive, saveComcardsBackupToDrive } from '../lib/googleDrive';

interface EditorViewProps {
  comcard: Comcard;
  onUpdateComcard: (updated: Comcard) => void;
  onBack: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  comcard,
  onUpdateComcard,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'photos' | 'style'>('info');
  const [newExpInput, setNewExpInput] = useState('');
  const [stageScale, setStageScale] = useState<number>(0.85);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropTargetKey, setCropTargetKey] = useState<keyof Comcard['photos']>('main');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [driveSyncSuccess, setDriveSyncSuccess] = useState(false);

  const comcardRef = useRef<HTMLDivElement>(null);

  // Sync comcard directly to Google Drive backend
  const handleSyncToDrive = async () => {
    setDriveSyncing(true);
    setDriveSyncSuccess(false);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (token) {
        await saveComcardsBackupToDrive(token, [comcard]);
        setDriveSyncSuccess(true);
        setTimeout(() => setDriveSyncSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Drive sync failed:', err);
    } finally {
      setDriveSyncing(false);
    }
  };

  // Helper to trigger auto-save status and update state
  const handleUpdate = (updater: (prev: Comcard) => Comcard) => {
    setSaveStatus('saving');
    const updated = updater(comcard);
    updated.updatedAt = new Date().toISOString();
    onUpdateComcard(updated);
    setTimeout(() => {
      setSaveStatus('saved');
    }, 400);
  };

  const handleAddExperience = () => {
    const trimmed = newExpInput.trim();
    if (!trimmed) return;
    handleUpdate((prev) => ({
      ...prev,
      experience: {
        showOnCard: prev.experience?.showOnCard ?? true,
        headline: prev.experience?.headline || 'Selected Experience & Highlights',
        items: [...(prev.experience?.items || []), trimmed],
        bio: prev.experience?.bio || '',
      },
    }));
    setNewExpInput('');
  };

  const openCropFor = (key: keyof Comcard['photos']) => {
    setCropTargetKey(key);
    setIsCropModalOpen(true);
  };

  const handleSaveCroppedPhoto = (updatedPhoto: PhotoItem) => {
    handleUpdate((prev) => ({
      ...prev,
      photos: {
        ...prev.photos,
        [cropTargetKey]: updatedPhoto,
      },
    }));
  };

  const photoLabels: Record<keyof Comcard['photos'], string> = {
    main: 'Main Portrait / Digi 1',
    grid1: 'Portfolio Shot 1 / Digi 2',
    grid2: 'Portfolio Shot 2 / Digi 3',
    grid3: 'Portfolio Shot 3 / Digi 4',
    grid4: 'Portfolio Shot 4 / Digi 5',
    grid5: 'Portfolio Shot 5 / Digi 6',
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAF9F5]">
      {/* Top Bar Header */}
      <header className="flex justify-between items-center h-16 px-6 w-full z-30 bg-white border-b border-[#E7E5E0] shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[#E7E5E0] text-[#171717] hover:bg-[#FAF9F5] transition-colors"
            title="Back to List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-sm text-[#171717]">{comcard.name || 'Untitled Comcard'}</h1>
            <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B]">
              <span className="capitalize">{comcard.templateId} Template</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Check className="w-3 h-3" /> {saveStatus === 'saving' ? 'Saving...' : 'Auto-saved'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sync to Google Drive Backend Button */}
          <button
            onClick={handleSyncToDrive}
            disabled={driveSyncing}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border shadow-2xs ${
              driveSyncSuccess
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-[#E7E5E0] text-[#171717] hover:bg-[#FAF9F5]'
            }`}
            title="Sinkronisasi Comcard & foto ke Google Drive backend"
          >
            {driveSyncing ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[#C9A227]" />
                <span>Syncing to Drive...</span>
              </>
            ) : driveSyncSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Drive Synced!</span>
              </>
            ) : (
              <>
                <HardDrive className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Save to Drive Backend</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-5 py-2.5 text-xs font-semibold bg-[#171717] hover:bg-black text-white rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" /> Export Comcard
          </button>
        </div>
      </header>

      {/* Editor Body split into Form Panel (Left) and Live Stage (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Form Navigation & Controls */}
        <div className="w-96 bg-white border-r border-[#E7E5E0] flex flex-col h-full shrink-0">
          {/* Form Tabs */}
          <div className="flex border-b border-[#E7E5E0] bg-[#FAF9F5] p-1 gap-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'bg-white text-[#171717] shadow-2xs'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Details
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === 'experience'
                  ? 'bg-white text-[#171717] shadow-2xs'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Exp
              {comcard.experience?.items && comcard.experience.items.length > 0 && (
                <span className="w-4 h-4 bg-[#171717] text-white text-[9px] rounded-full flex items-center justify-center font-mono">
                  {comcard.experience.items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'photos'
                  ? 'bg-white text-[#171717] shadow-2xs'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Photos
            </button>
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'style'
                  ? 'bg-white text-[#171717] shadow-2xs'
                  : 'text-[#6B6B6B] hover:text-[#171717]'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Style
            </button>
          </div>

          {/* Form Controls Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: MODEL DETAILS */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {/* Basic Identification */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                    Basic Info
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#6B6B6B] mb-1 font-medium">Full Name</label>
                      <input
                        type="text"
                        value={comcard.name}
                        onChange={(e) =>
                          handleUpdate((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#6B6B6B] mb-1 font-medium">Display Name on Card</label>
                      <input
                        type="text"
                        value={comcard.displayName}
                        onChange={(e) =>
                          handleUpdate((prev) => ({ ...prev, displayName: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[#6B6B6B] mb-1 font-medium">Age</label>
                        <input
                          type="text"
                          value={comcard.age}
                          onChange={(e) =>
                            handleUpdate((prev) => ({ ...prev, age: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[#6B6B6B] mb-1 font-medium">Gender</label>
                        <input
                          type="text"
                          value={comcard.gender}
                          onChange={(e) =>
                            handleUpdate((prev) => ({ ...prev, gender: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physical Measurements */}
                <div className="pt-4 border-t border-[#E7E5E0]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Physical Specs
                    </h3>
                    <span className="text-[10px] text-[#6B6B6B]">Toggle eye to show/hide</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { key: 'height' as const, label: 'Height (Tinggi)' },
                      { key: 'weight' as const, label: 'Weight (Berat Badan)' },
                      { key: 'bust' as const, label: 'Bust / Chest' },
                      { key: 'waist' as const, label: 'Waist' },
                      { key: 'hips' as const, label: 'Hips' },
                      { key: 'shoeSize' as const, label: 'Shoe Size' },
                      { key: 'clothingSize' as const, label: 'Dress / Suit' },
                      { key: 'hair' as const, label: 'Hair Color' },
                      { key: 'eyes' as const, label: 'Eye Color' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={item.label}
                          value={comcard.stats[item.key]}
                          onChange={(e) =>
                            handleUpdate((prev) => ({
                              ...prev,
                              stats: { ...prev.stats, [item.key]: e.target.value },
                            }))
                          }
                          className="flex-1 px-3 py-1.5 border border-[#E7E5E0] rounded-lg text-xs focus:border-[#171717] focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            handleUpdate((prev) => ({
                              ...prev,
                              visibleStats: {
                                ...prev.visibleStats,
                                [item.key]: !prev.visibleStats[item.key],
                              },
                            }))
                          }
                          className={`p-1.5 rounded-lg border transition-colors ${
                            comcard.visibleStats[item.key]
                              ? 'bg-[#171717] text-white border-[#171717]'
                              : 'bg-[#FAF9F5] text-[#6B6B6B] border-[#E7E5E0]'
                          }`}
                          title="Toggle visibility"
                        >
                          {comcard.visibleStats[item.key] ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agency & Contact Info */}
                <div className="pt-4 border-t border-[#E7E5E0]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                    Agency & Contact
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[#6B6B6B] mb-1 font-medium">Agency Name</label>
                      <input
                        type="text"
                        value={comcard.contact.agency}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, agency: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#6B6B6B] mb-1 font-medium">Instagram</label>
                      <input
                        type="text"
                        value={comcard.contact.instagram}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, instagram: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#6B6B6B] mb-1 font-medium">Phone Number</label>
                      <input
                        type="text"
                        value={comcard.contact.phone}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, phone: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#6B6B6B] mb-1 font-medium">Email</label>
                      <input
                        type="text"
                        value={comcard.contact.email}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            contact: { ...prev.contact, email: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EXPERIENCE & CAREER HIGHLIGHTS */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                {/* Experience Master Toggle */}
                <div className="p-4 bg-[#FAF9F5] border border-[#E7E5E0] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#171717]" />
                      <span className="font-bold text-xs text-[#171717]">Tampilkan di Comcard</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comcard.experience?.showOnCard ?? true}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            experience: {
                              showOnCard: e.target.checked,
                              headline: prev.experience?.headline || 'Selected Experience & Highlights',
                              items: prev.experience?.items || [],
                              bio: prev.experience?.bio || '',
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#171717]"></div>
                    </label>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                    Menampilkan rekam jejak runway, editorial majalah, kampanye komersial, dan casting credits langsung di kartu Comcard Anda.
                  </p>
                </div>

                {/* Experience Headline / Section Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
                    Judul Bagian / Headline
                  </label>
                  <input
                    type="text"
                    value={comcard.experience?.headline || 'Selected Experience & Highlights'}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        experience: {
                          showOnCard: prev.experience?.showOnCard ?? true,
                          headline: e.target.value,
                          items: prev.experience?.items || [],
                          bio: prev.experience?.bio || '',
                        },
                      }))
                    }
                    placeholder="e.g. Selected Experience, Runway Credits, Commercial Portfolio"
                    className="w-full px-3 py-2 text-xs border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none bg-white"
                  />
                </div>

                {/* Add New Experience Item */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
                    Tambah Pengalaman Baru
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExpInput}
                      onChange={(e) => setNewExpInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddExperience();
                        }
                      }}
                      placeholder="e.g. Jakarta Fashion Week 2024, Vogue Editorial..."
                      className="flex-1 px-3 py-2 text-xs border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none bg-white"
                    />
                    <button
                      onClick={handleAddExperience}
                      className="px-3 py-2 bg-[#171717] text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah
                    </button>
                  </div>

                  {/* Preset Suggestions Quick Add */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block mb-1.5">
                      Saran Cepat:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Jakarta Fashion Week 2024 (Runway)',
                        "Vogue Indonesia (Editorial)",
                        'UNIQLO Spring Campaign',
                        'Paris Fashion Week SS25',
                        "Harper's Bazaar Cover",
                        'Bali International Fashion Weekend',
                        'Dior Beauty Lookbook',
                        'Commercial TVC / Brand Ambassador',
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!comcard.experience?.items?.includes(preset)) {
                              handleUpdate((prev) => ({
                                ...prev,
                                experience: {
                                  showOnCard: prev.experience?.showOnCard ?? true,
                                  headline: prev.experience?.headline || 'Selected Experience & Highlights',
                                  items: [...(prev.experience?.items || []), preset],
                                  bio: prev.experience?.bio || '',
                                },
                              }));
                            }
                          }}
                          className="px-2 py-1 bg-white border border-[#E7E5E0] hover:border-[#171717] rounded-md text-[10px] text-[#444444] transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Experience Items List */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Daftar Pengalaman ({comcard.experience?.items?.length || 0})
                    </label>
                    {comcard.experience?.items && comcard.experience.items.length > 0 && (
                      <button
                        onClick={() =>
                          handleUpdate((prev) => ({
                            ...prev,
                            experience: {
                              ...prev.experience!,
                              items: [],
                            },
                          }))
                        }
                        className="text-[10px] text-red-600 hover:underline"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>

                  {(!comcard.experience?.items || comcard.experience.items.length === 0) ? (
                    <div className="p-5 border border-dashed border-[#E7E5E0] rounded-xl text-center text-xs text-[#888888] space-y-1 bg-[#FAF9F5]">
                      <Briefcase className="w-5 h-5 mx-auto text-[#AAAAAA] mb-1" />
                      <p className="font-semibold text-[#444444]">Belum ada pengalaman ditambahkan</p>
                      <p className="text-[11px]">Ketik pengalaman di atas atau klik salah satu saran cepat.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {comcard.experience.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-white border border-[#E7E5E0] rounded-lg flex items-center justify-between gap-2 hover:border-[#171717]/40 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-5 h-5 rounded-full bg-[#FAF9F5] border border-[#E7E5E0] text-[10px] font-bold text-[#666666] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-[#171717] font-medium truncate">{item}</span>
                          </div>
                          <button
                            onClick={() => {
                              handleUpdate((prev) => ({
                                ...prev,
                                experience: {
                                  ...prev.experience!,
                                  items: prev.experience!.items.filter((_, i) => i !== idx),
                                },
                              }));
                            }}
                            className="p-1 text-[#888888] hover:text-red-600 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Short Bio / Casting Notes */}
                <div className="space-y-2 pt-2 border-t border-[#E7E5E0]">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
                    Bio Singkat / Catatan Casting
                  </label>
                  <textarea
                    rows={3}
                    value={comcard.experience?.bio || ''}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        experience: {
                          showOnCard: prev.experience?.showOnCard ?? true,
                          headline: prev.experience?.headline || 'Selected Experience & Highlights',
                          items: prev.experience?.items || [],
                          bio: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. Model profesional dengan pengalaman runway internasional. Siap untuk direct booking dan travel dengan paspor aktif."
                    className="w-full px-3 py-2 text-xs border border-[#E7E5E0] rounded-lg focus:border-[#171717] focus:outline-none bg-white"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PHOTOS EDITING */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                {/* Google Drive Backend banner */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                  <HardDrive className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-[#171717]">Google Drive Backend Storage</div>
                    <div className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Foto yang diunggah disimpan di folder Google Drive <code className="text-[#A38220] font-mono">Orland Management / Model Photos</code>. Klik "Edit / Drive Upload" untuk memilih atau mengunggah foto baru.
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#6B6B6B]">
                  Kelola foto portofolio model. Foto ke-6 digunakan khusus pada template 6-Shot (seperti Select London):
                </p>

                {(['main', 'grid1', 'grid2', 'grid3', 'grid4', 'grid5'] as Array<keyof Comcard['photos']>).map((key) => {
                  const photo = comcard.photos[key] || { url: '', zoom: 1, cropX: 0, cropY: 0 };
                  const label = photoLabels[key];

                  return (
                    <div
                      key={key}
                      className="p-3 bg-[#FAF9F5] border border-[#E7E5E0] rounded-xl flex items-center gap-3 hover:border-[#C9A227]/50 transition-colors"
                    >
                      <div className="w-16 h-20 bg-white border border-[#E7E5E0] rounded-lg overflow-hidden shrink-0 relative">
                        {photo.url ? (
                          <img
                            src={photo.url}
                            alt={label}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#747878]">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                        {photo.driveFileId && (
                          <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-xs text-[#D4A737] p-0.5 rounded shadow-2xs" title="Tersimpan di Google Drive Backend">
                            <HardDrive className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-[#171717] truncate">{label}</h4>
                          {photo.driveFileId && (
                            <span className="text-[9px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                              Drive
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5 truncate">
                          {photo.fileName ? photo.fileName : key === 'main' ? 'Hero portrait' : key === 'grid5' ? 'Digi 6 / full length profile' : 'Portfolio grid thumbnail'}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => openCropFor(key)}
                            className="px-2.5 py-1 bg-white border border-[#E7E5E0] rounded-md text-[11px] font-semibold text-[#171717] hover:border-[#171717] transition-colors flex items-center gap-1 shadow-2xs"
                          >
                            <Crop className="w-3 h-3" /> Edit / Drive Upload
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: TEMPLATE & STYLING */}
            {activeTab === 'style' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                    Choose Template
                  </h3>
                  <div className="space-y-3">
                    {TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() =>
                          handleUpdate((prev) => ({ ...prev, templateId: tmpl.id }))
                        }
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          comcard.templateId === tmpl.id
                            ? 'border-[#171717] bg-[#FAF9F5] ring-2 ring-[#171717]'
                            : 'border-[#E7E5E0] bg-white hover:border-[#171717]'
                        }`}
                      >
                        <div className="font-bold text-xs text-[#171717] mb-0.5">{tmpl.name}</div>
                        <div className="text-[11px] text-[#6B6B6B]">{tmpl.tagline}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E7E5E0]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                    Accent Styling
                  </h3>
                  <div className="flex items-center gap-3">
                    {['#171717', '#C9A227', '#2563EB', '#059669', '#DC2626'].map((color) => (
                      <button
                        key={color}
                        onClick={() =>
                          handleUpdate((prev) => ({ ...prev, accentColor: color }))
                        }
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          comcard.accentColor === color ? 'scale-110 border-[#171717]' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center/Right LIVE PREVIEW Canvas Stage */}
        <div className="flex-1 bg-[#E3E2DF] overflow-auto flex items-center justify-center relative min-w-0">
          {/* Zoom controls for canvas */}
          <div className="absolute top-4 right-6 bg-white/95 backdrop-blur-xs border border-[#E7E5E0] rounded-xl p-1 flex items-center gap-1 shadow-xs z-20">
            <button
              onClick={() => setStageScale((s) => Math.max(0.5, s - 0.1))}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FAF9F5]"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-[#171717] px-2 min-w-[45px] text-center font-medium select-none">
              {Math.round(stageScale * 100)}%
            </span>
            <button
              onClick={() => setStageScale((s) => Math.min(1.3, s + 0.1))}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FAF9F5]"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setStageScale(0.85)}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#171717] hover:bg-[#FAF9F5]"
              title="Reset Zoom (85%)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Render printable live preview centered */}
          <div className="m-auto py-10 px-6 flex items-center justify-center">
            <ComcardCardRenderer ref={comcardRef} comcard={comcard} scale={stageScale} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <PhotoCropModal
        isOpen={isCropModalOpen}
        title={photoLabels[cropTargetKey]}
        photo={comcard.photos[cropTargetKey]}
        onSave={handleSaveCroppedPhoto}
        onClose={() => setIsCropModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        comcard={comcard}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};
