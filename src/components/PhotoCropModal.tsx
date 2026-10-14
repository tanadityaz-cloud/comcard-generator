import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Upload,
  Image as ImageIcon,
  Move,
  HardDrive,
  Sparkles,
  RefreshCw,
  FolderOpen,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { PhotoItem } from '../types';
import { PRESET_STOCK_PHOTOS } from '../data/mockData';
import { getAccessToken, googleSignIn, auth } from '../lib/firebaseAuth';
import {
  uploadModelPhotoToDrive,
  listDriveModelPhotos,
  DriveFileItem,
  getDriveDirectImageUrl,
} from '../lib/googleDrive';

interface PhotoCropModalProps {
  isOpen: boolean;
  title: string;
  photo: PhotoItem;
  onSave: (updatedPhoto: PhotoItem) => void;
  onClose: () => void;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  title,
  photo,
  onSave,
  onClose,
}) => {
  const [url, setUrl] = useState(photo.url);
  const [zoom, setZoom] = useState(photo.zoom || 1);
  const [cropX, setCropX] = useState(photo.cropX || 0);
  const [cropY, setCropY] = useState(photo.cropY || 0);
  const [driveFileId, setDriveFileId] = useState<string | undefined>(photo.driveFileId);
  const [driveLink, setDriveLink] = useState<string | undefined>(photo.driveLink);
  const [fileName, setFileName] = useState<string | undefined>(photo.fileName);

  const [activeTab, setActiveTab] = useState<'adjust' | 'drive' | 'upload' | 'presets'>('adjust');
  const [isDragging, setIsDragging] = useState(false);

  // Google Drive photo backend state
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);
  const [drivePhotos, setDrivePhotos] = useState<DriveFileItem[]>([]);
  const [isLoadingDrivePhotos, setIsLoadingDrivePhotos] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    startCropX: number;
    startCropY: number;
  } | null>(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsSignedIn(!!user);
      if (user && activeTab === 'drive') {
        loadDrivePhotos();
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  // Load photos from Google Drive backend
  const loadDrivePhotos = async () => {
    setIsLoadingDrivePhotos(true);
    setDriveError(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        setIsLoadingDrivePhotos(false);
        return;
      }
      const files = await listDriveModelPhotos(token);
      setDrivePhotos(files);
    } catch (err: any) {
      console.error('Failed to load drive photos:', err);
      setDriveError(err.message || 'Gagal memuat foto dari Google Drive backend');
    } finally {
      setIsLoadingDrivePhotos(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'drive' && isSignedIn && drivePhotos.length === 0) {
      loadDrivePhotos();
    }
  }, [activeTab, isSignedIn]);

  // Global window listeners for drag movement
  useEffect(() => {
    if (!isDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const newX = Math.round(dragStartRef.current.startCropX + deltaX / Math.max(0.5, zoom));
      const newY = Math.round(dragStartRef.current.startCropY + deltaY / Math.max(0.5, zoom));

      setCropX(Math.max(-150, Math.min(150, newX)));
      setCropY(Math.max(-150, Math.min(150, newY)));
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      if (!dragStartRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - dragStartRef.current.startX;
      const deltaY = e.touches[0].clientY - dragStartRef.current.startY;

      const newX = Math.round(dragStartRef.current.startCropX + deltaX / Math.max(0.5, zoom));
      const newY = Math.round(dragStartRef.current.startCropY + deltaY / Math.max(0.5, zoom));

      setCropX(Math.max(-150, Math.min(150, newX)));
      setCropY(Math.max(-150, Math.min(150, newY)));
    };

    const handleWindowTouchEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchmove', handleWindowTouchMove);
    window.addEventListener('touchend', handleWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
    };
  }, [isDragging, zoom]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startCropX: cropX,
      startCropY: cropY,
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startCropX: cropX,
        startCropY: cropY,
      };
    }
  };

  // Upload file directly to Google Drive backend
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Immediate local preview for responsive feedback
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUrl(event.target.result as string);
        setZoom(1);
        setCropX(0);
        setCropY(0);
        setFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
    setPendingFile(file);

    // 2. Upload to Google Drive Backend ONLY if already authenticated
    // DO NOT call signInWithPopup inside a file input onChange event, because browsers block it!
    const token = await getAccessToken();
    if (!token) {
      // User is not signed in yet; keep the local preview active
      setIsUploadingToDrive(false);
      setDriveUploadSuccess(null);
      setDriveError(null);
      return;
    }

    setIsUploadingToDrive(true);
    setDriveUploadSuccess(null);
    setDriveError(null);

    try {
      const safeName = `Orland_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const uploaded = await uploadModelPhotoToDrive(token, file, safeName);
      
      // Update photo reference to Google Drive backend
      setDriveFileId(uploaded.id);
      setDriveLink(uploaded.webViewLink);
      setFileName(uploaded.name);
      setUrl(uploaded.url);

      setDriveUploadSuccess(`Disimpan di Google Drive Backend (Orland Management / Model Photos)`);
      loadDrivePhotos();
    } catch (err: any) {
      console.error('Drive upload error:', err);
      setDriveError(err.message || 'Gagal mengunggah ke Google Drive backend.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Select an existing photo from Google Drive backend
  const handleSelectFromDrive = (driveFile: DriveFileItem) => {
    const directUrl = getDriveDirectImageUrl(driveFile.id);
    setUrl(directUrl);
    setDriveFileId(driveFile.id);
    setDriveLink(driveFile.webViewLink);
    setFileName(driveFile.name);
    setZoom(1);
    setCropX(0);
    setCropY(0);
    setActiveTab('adjust');
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setIsSignedIn(true);
        loadDrivePhotos();

        // If user already had a file pending upload, upload it now
        if (pendingFile) {
          setIsUploadingToDrive(true);
          try {
            const safeName = `Orland_${Date.now()}_${pendingFile.name.replace(/\s+/g, '_')}`;
            const uploaded = await uploadModelPhotoToDrive(res.accessToken, pendingFile, safeName);
            setDriveFileId(uploaded.id);
            setDriveLink(uploaded.webViewLink);
            setFileName(uploaded.name);
            setUrl(uploaded.url);
            setDriveUploadSuccess(`Disimpan di Google Drive Backend (Orland Management / Model Photos)`);
            loadDrivePhotos();
          } catch (e: any) {
            setDriveError(e.message || 'Gagal mengunggah file ke Google Drive.');
          } finally {
            setIsUploadingToDrive(false);
          }
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Popup-blocked event is automatically handled by global modal
    }
  };

  const handleReset = () => {
    setZoom(1);
    setCropX(0);
    setCropY(0);
  };

  const handleApply = () => {
    onSave({
      url,
      zoom,
      cropX,
      cropY,
      driveFileId,
      driveLink,
      fileName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#171717]">Edit {title}</h3>
            {driveFileId && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                <HardDrive className="w-3 h-3 text-emerald-600" /> Drive Backend
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6B6B6B] hover:bg-[#FAF9F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E7E5E0] bg-[#FAF9F5] px-6 gap-2">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'adjust'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            Crop & Posisi
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'drive'
                ? 'border-[#C9A227] text-[#A38220]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-[#C9A227]" />
            Penyimpanan Drive
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-[#171717] text-[#171717]'
                : 'border-transparent text-[#6B6B6B] hover:text-[#171717]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Agency Presets
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: ADJUST / CROP */}
          {activeTab === 'adjust' && (
            <div className="flex flex-col items-center gap-6">
              {/* Preview Stage with Interactive Dragging */}
              <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className="w-64 h-80 bg-[#171717] rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border-2 border-[#E7E5E0] shadow-inner select-none flex items-center justify-center group"
              >
                <div
                  className="w-full h-full relative transition-transform duration-75 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${cropX}px, ${cropY}px) scale(${zoom})`,
                  }}
                >
                  <img
                    src={url}
                    alt="Preview"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                  />
                </div>

                {/* Framing Overlay Guidelines */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div className="border-r border-b border-white/15"></div>
                  <div></div>
                </div>

                {/* Helper hint */}
                <div className="absolute bottom-2 inset-x-0 mx-auto w-max px-2.5 py-1 bg-black/70 backdrop-blur-xs rounded-full text-[10px] text-white/90 font-medium flex items-center gap-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                  <Move className="w-3 h-3" />
                  <span>Klik & geser untuk mengatur posisi</span>
                </div>
              </div>

              {/* Current file info */}
              {fileName && (
                <div className="text-center text-xs text-[#6B6B6B]">
                  File aktif: <span className="font-semibold text-[#171717]">{fileName}</span>
                </div>
              )}

              {/* Controls */}
              <div className="w-full max-w-md space-y-4 bg-[#FAF9F5] p-4 rounded-xl border border-[#E7E5E0]">
                {/* Zoom Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#171717] mb-2">
                    <span className="flex items-center gap-1.5">
                      <ZoomIn className="w-3.5 h-3.5 text-[#6B6B6B]" /> Zoom Scale
                    </span>
                    <span className="text-[#6B6B6B] font-mono">{zoom.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-[#6B6B6B]" />
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-[#171717] h-1.5 bg-[#E7E5E0] rounded-lg appearance-none cursor-pointer"
                    />
                    <ZoomIn className="w-4 h-4 text-[#6B6B6B]" />
                  </div>
                </div>

                {/* Position Fine-Tuning Coordinates */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E7E5E0]">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Horizontal (X): {cropX}px
                    </label>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={cropX}
                      onChange={(e) => setCropX(parseInt(e.target.value, 10))}
                      className="w-full accent-[#171717] h-1.5 bg-[#E7E5E0] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B6B6B] block mb-1">
                      Vertical (Y): {cropY}px
                    </label>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={cropY}
                      onChange={(e) => setCropY(parseInt(e.target.value, 10))}
                      className="w-full accent-[#171717] h-1.5 bg-[#E7E5E0] rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleReset}
                    className="text-xs text-[#6B6B6B] hover:text-[#171717] flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Posisi
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE BACKEND STORAGE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#FAF9F5] p-4 rounded-xl border border-[#E7E5E0]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-[#C9A227]">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#171717]">
                      Google Drive Backend Storage
                    </h4>
                    <p className="text-xs text-[#6B6B6B]">
                      Folder: <code className="text-[#A38220] font-mono">Orland Management / Model Photos</code>
                    </p>
                  </div>
                </div>

                {isSignedIn ? (
                  <button
                    onClick={loadDrivePhotos}
                    disabled={isLoadingDrivePhotos}
                    className="p-2 border border-[#E7E5E0] rounded-lg text-[#171717] hover:bg-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    title="Refresh dari Google Drive"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrivePhotos ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    className="px-4 py-2 bg-[#171717] text-white rounded-xl text-xs font-semibold hover:bg-black transition-all flex items-center gap-2"
                  >
                    <Cloud className="w-4 h-4 text-[#D4A737]" /> Hubungkan Drive
                  </button>
                )}
              </div>

              {!isSignedIn ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E7E5E0] rounded-2xl bg-white space-y-3">
                  <Cloud className="w-12 h-12 text-[#C9A227] mx-auto opacity-70" />
                  <h4 className="text-sm font-bold text-[#171717]">
                    Gunakan Google Drive Sebagai Backend File
                  </h4>
                  <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
                    Masuk dengan akun Google Anda untuk menyimpan seluruh file foto model langsung ke akun Google Drive pribadi Anda secara aman.
                  </p>
                  <button
                    onClick={handleConnectGoogle}
                    className="px-6 py-2.5 bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-semibold transition-all shadow-xs inline-flex items-center gap-2"
                  >
                    <Cloud className="w-4 h-4 text-[#D4A737]" /> Sign in with Google
                  </button>
                </div>
              ) : isLoadingDrivePhotos ? (
                <div className="p-12 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-[#C9A227] animate-spin mx-auto" />
                  <p className="text-xs text-[#6B6B6B]">Memuat foto dari Google Drive backend...</p>
                </div>
              ) : driveError ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                  <p className="font-semibold">Terjadi kendala saat membaca Google Drive:</p>
                  <p>{driveError}</p>
                  <button
                    onClick={loadDrivePhotos}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-red-900 font-semibold"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : drivePhotos.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-[#E7E5E0] rounded-2xl space-y-3">
                  <FolderOpen className="w-10 h-10 text-[#6B6B6B] mx-auto opacity-50" />
                  <p className="text-sm font-semibold text-[#171717]">
                    Belum ada foto di folder Google Drive
                  </p>
                  <p className="text-xs text-[#6B6B6B]">
                    Unggah foto model pertama Anda melalui tab "Upload File" di atas.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-[#171717] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Upload Foto Sekarang
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-[#6B6B6B] mb-2 flex items-center justify-between">
                    <span>Pilih Foto dari Drive ({drivePhotos.length} foto tersedia)</span>
                    <span className="text-[10px] text-zinc-400">Klik untuk memilih</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
                    {drivePhotos.map((file) => {
                      const isSelected = driveFileId === file.id;
                      const thumb = file.thumbnailLink
                        ? file.thumbnailLink.replace(/=s\d+$/, '=s400')
                        : getDriveDirectImageUrl(file.id);

                      return (
                        <div
                          key={file.id}
                          onClick={() => handleSelectFromDrive(file)}
                          className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-3/4 bg-zinc-100 ${
                            isSelected
                              ? 'border-[#C9A227] shadow-md ring-2 ring-[#C9A227]/30 scale-[1.02]'
                              : 'border-[#E7E5E0] hover:border-[#171717]'
                          }`}
                        >
                          <img
                            src={thumb}
                            alt={file.name}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <span className="text-[9px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] bg-white text-[#171717] font-bold py-1 px-2 rounded-lg text-center shadow-xs">
                              Gunakan Foto
                            </span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-[#C9A227] text-white p-1 rounded-full shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DIRECT UPLOAD TO DRIVE */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E7E5E0] rounded-2xl bg-[#FAF9F5] space-y-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#C9A227] mb-3 shadow-2xs">
                  <HardDrive className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-[#171717] mb-1">
                  Upload ke Google Drive Backend
                </h4>
                <p className="text-xs text-[#6B6B6B] max-w-sm">
                  Simpan foto model resolusi tinggi ke folder <strong className="text-[#171717]">Orland Management / Model Photos</strong> di Google Drive Anda.
                </p>
              </div>

              {/* Authentication Status Prompt if not signed in */}
              {!isSignedIn ? (
                <div className="w-full max-w-sm p-4 bg-white border border-amber-200 rounded-xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                    <Sparkles className="w-4 h-4 text-[#C9A227]" />
                    <span>Otorisasi Google Diperlukan</span>
                  </div>
                  <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                    Klik tombol di bawah ini untuk menghubungkan akun Google Anda secara langsung:
                  </p>
                  <button
                    onClick={handleConnectGoogle}
                    className="w-full py-2.5 bg-[#171717] hover:bg-black text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-[#D4A737]" />
                    <span>Masuk dengan Google (Sign in)</span>
                  </button>

                  <div className="pt-2 border-t border-[#E7E5E0] flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-zinc-400">Atau pilih file untuk preview lokal:</span>
                    <label className="text-xs font-medium text-[#171717] hover:underline cursor-pointer">
                      Pilih file lokal dari komputer
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm space-y-3 flex flex-col items-center">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between w-full text-xs text-emerald-900 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Google Drive Terhubung
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Aktif
                    </span>
                  </div>

                  <label className="w-full bg-[#171717] hover:bg-black text-white px-6 py-3 rounded-xl font-semibold text-xs cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" /> Pilih & Upload File ke Google Drive
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Upload Status */}
              {isUploadingToDrive && (
                <div className="w-full max-w-sm p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <Sparkles className="w-4 h-4 animate-spin text-[#C9A227] shrink-0" />
                  <span>Mengunggah file ke Google Drive Backend...</span>
                </div>
              )}

              {driveUploadSuccess && (
                <div className="w-full max-w-sm p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{driveUploadSuccess}</span>
                </div>
              )}

              {driveError && (
                <div className="w-full max-w-sm p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {driveError}
                </div>
              )}

              <div className="text-[11px] text-[#6B6B6B]">
                Format yang didukung: JPG, PNG, WEBP (disarankan min. 1200x1600px)
              </div>
            </div>
          )}

          {/* TAB 4: STOCK PRESETS */}
          {activeTab === 'presets' && (
            <div>
              <p className="text-xs text-[#6B6B6B] mb-4">
                Pilih foto editorial beresolusi tinggi dari katalog agensi Orland Management:
              </p>
              <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                {PRESET_STOCK_PHOTOS.map((stockItem, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setUrl(stockItem.url);
                      setZoom(1);
                      setCropX(0);
                      setCropY(0);
                      setDriveFileId(undefined);
                      setDriveLink(undefined);
                      setFileName(stockItem.name || `Agency_Stock_${idx + 1}`);
                      setActiveTab('adjust');
                    }}
                    className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-3/4 ${
                      url === stockItem.url
                        ? 'border-[#171717] shadow-md scale-[1.02]'
                        : 'border-[#E7E5E0] hover:border-[#6B6B6B]'
                    }`}
                  >
                    <img
                      src={stockItem.url}
                      alt={stockItem.name || `Stock ${idx + 1}`}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs bg-white text-[#171717] font-semibold py-1 px-3 rounded-lg shadow-sm">
                        Gunakan Foto
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#E7E5E0] flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium border border-[#E7E5E0] rounded-lg text-[#171717] hover:bg-white transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2.5 bg-[#171717] text-white rounded-xl font-medium text-xs flex items-center gap-1.5 hover:bg-black transition-all shadow-xs"
          >
            <Check className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};
