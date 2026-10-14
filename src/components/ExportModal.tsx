import React, { useState } from 'react';
import {
  X,
  Download,
  FileImage,
  FileText,
  Printer,
  Check,
  Sparkles,
  HardDrive,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Comcard } from '../types';
import { getAccessToken, googleSignIn } from '../lib/firebaseAuth';
import { uploadComcardToDrive } from '../lib/googleDrive';

interface ExportModalProps {
  isOpen: boolean;
  comcard: Comcard;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, comcard, onClose }) => {
  const [format, setFormat] = useState<'png' | 'jpg' | 'pdf'>('png');
  const [presetSize, setPresetSize] = useState<'digital' | 'print'>('digital');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Google Drive Export State
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [driveError, setDriveError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper to get image blob from printable area
  const generateExportBlob = async (): Promise<{ blob: Blob; fileName: string }> => {
    const printableElement = document.getElementById('comcard-printable-area');
    if (!printableElement) {
      throw new Error('Comcard element not found');
    }

    const pixelRatio = presetSize === 'print' ? 3 : 2;
    const baseName = `${comcard.name.replace(/\s+/g, '_')}_Comcard`;
    const options = {
      pixelRatio,
      backgroundColor: '#FAF9F5',
      cacheBust: true,
    };

    if (format === 'png') {
      const dataUrl = await toPng(printableElement, options);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return { blob, fileName: `${baseName}.png` };
    } else if (format === 'jpg') {
      const dataUrl = await toJpeg(printableElement, { ...options, quality: 0.95 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return { blob, fileName: `${baseName}.jpg` };
    } else {
      const dataUrl = await toPng(printableElement, options);
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (img.height * imgWidth) / img.width;
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      const pdfBlob = pdf.output('blob');
      return { blob: pdfBlob, fileName: `${baseName}.pdf` };
    }
  };

  const handleDownload = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const { blob, fileName } = await generateExportBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please check browser permissions and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToDrive = async () => {
    setIsSavingToDrive(true);
    setDriveError(null);
    setDriveSavedLink(null);

    try {
      let token = await getAccessToken();
      if (!token) {
        // Authenticate with Google popup
        const authResult = await googleSignIn();
        if (!authResult?.accessToken) {
          throw new Error('Google authentication cancelled or failed');
        }
        token = authResult.accessToken;
      }

      const { blob, fileName } = await generateExportBlob();
      const uploadedFile = await uploadComcardToDrive(token, blob, fileName);

      if (uploadedFile.webViewLink) {
        setDriveSavedLink(uploadedFile.webViewLink);
      } else {
        setDriveSavedLink(`https://drive.google.com/file/d/${uploadedFile.id}/view`);
      }
    } catch (err: any) {
      console.error('Google Drive save error:', err);
      setDriveError(err.message || 'Failed to save to Google Drive');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E7E5E0]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#171717]" />
            <h3 className="font-bold text-lg text-[#171717]">Export Comcard</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#6B6B6B] hover:bg-[#FAF9F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Format Picker */}
          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2.5">
              1. Choose Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                  format === 'png'
                    ? 'border-[#171717] bg-[#171717] text-white shadow-xs'
                    : 'border-[#E7E5E0] bg-white text-[#171717] hover:border-[#171717]'
                }`}
              >
                <FileImage className="w-6 h-6 mb-1.5" />
                <span className="font-bold text-xs">PNG</span>
                <span className={`text-[10px] ${format === 'png' ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                  High Quality Image
                </span>
              </button>

              <button
                onClick={() => setFormat('jpg')}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                  format === 'jpg'
                    ? 'border-[#171717] bg-[#171717] text-white shadow-xs'
                    : 'border-[#E7E5E0] bg-white text-[#171717] hover:border-[#171717]'
                }`}
              >
                <FileImage className="w-6 h-6 mb-1.5" />
                <span className="font-bold text-xs">JPG</span>
                <span className={`text-[10px] ${format === 'jpg' ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                  Web Standard
                </span>
              </button>

              <button
                onClick={() => setFormat('pdf')}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                  format === 'pdf'
                    ? 'border-[#171717] bg-[#171717] text-white shadow-xs'
                    : 'border-[#E7E5E0] bg-white text-[#171717] hover:border-[#171717]'
                }`}
              >
                <FileText className="w-6 h-6 mb-1.5" />
                <span className="font-bold text-xs">PDF</span>
                <span className={`text-[10px] ${format === 'pdf' ? 'text-white/80' : 'text-[#6B6B6B]'}`}>
                  Print Document
                </span>
              </button>
            </div>
          </div>

          {/* Preset Size Option */}
          <div>
            <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-2.5">
              2. Resolution Preset
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPresetSize('digital')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  presetSize === 'digital'
                    ? 'border-[#171717] bg-[#FAF9F5] ring-2 ring-[#171717]'
                    : 'border-[#E7E5E0] bg-white hover:border-[#171717]'
                }`}
              >
                <div className="font-bold text-xs text-[#171717] mb-0.5">Digital / Social</div>
                <div className="text-[11px] text-[#6B6B6B]">1080 × 1350 px • Optimised for Email & Instagram</div>
              </button>

              <button
                onClick={() => setPresetSize('print')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  presetSize === 'print'
                    ? 'border-[#171717] bg-[#FAF9F5] ring-2 ring-[#171717]'
                    : 'border-[#E7E5E0] bg-white hover:border-[#171717]'
                }`}
              >
                <div className="font-bold text-xs text-[#171717] mb-0.5">Print Ready (A4)</div>
                <div className="text-[11px] text-[#6B6B6B]">2480 × 3508 px • 300 DPI Ultra High Res</div>
              </button>
            </div>
          </div>

          {/* Google Drive Status & Feedback */}
          {driveSavedLink && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 text-xs">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Saved to Google Drive in <strong>Orland Management / Comcards</strong></span>
              </div>
              <a
                href={driveSavedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
              >
                Open in Drive <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {driveError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{driveError}</span>
            </div>
          )}

          {/* Direct Print Option */}
          <div className="pt-2 border-t border-[#E7E5E0] flex justify-between items-center">
            <div className="text-xs text-[#6B6B6B]">Need physical printouts now?</div>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 border border-[#E7E5E0] hover:border-[#171717] rounded-lg text-xs font-medium text-[#171717] flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Direct Print
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#E7E5E0] flex flex-wrap gap-2 justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium border border-[#E7E5E0] rounded-lg text-[#171717] hover:bg-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* Google Drive Save Action */}
            <button
              onClick={handleSaveToDrive}
              disabled={isSavingToDrive || isExporting}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-2xs active:scale-[0.98] disabled:opacity-50"
            >
              {isSavingToDrive ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-black" /> Saving to Drive...
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 text-black" /> Save to Google Drive
                </>
              )}
            </button>

            {/* Local Download Action */}
            <button
              onClick={handleDownload}
              disabled={isExporting || isSavingToDrive}
              className="px-5 py-2.5 bg-[#171717] hover:bg-black text-white rounded-xl font-medium text-xs flex items-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Rendering...
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Exported!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
