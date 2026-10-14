import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  FolderSync,
  Upload,
  ExternalLink,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  Folder,
  FileImage,
  FileText,
  FileCode,
  ShieldCheck,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
} from '../lib/firebaseAuth';
import {
  listOrlandDriveFiles,
  deleteDriveFile,
  saveComcardsBackupToDrive,
  uploadModelPhotoToDrive,
  DriveFileItem,
} from '../lib/googleDrive';
import { Comcard } from '../types';

interface DriveSyncViewProps {
  comcards: Comcard[];
}

export const DriveSyncView: React.FC<DriveSyncViewProps> = ({ comcards }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Files state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Backup state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // Direct upload to Drive state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Destructive deletion confirmation state (Mandatory per Skill guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
        setIsLoadingAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setIsLoadingAuth(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch files when token is available
  useEffect(() => {
    if (token) {
      loadFiles(token);
    } else {
      setDriveFiles([]);
    }
  }, [token]);

  const loadFiles = async (accessToken: string) => {
    setIsLoadingFiles(true);
    setFileError(null);
    try {
      const files = await listOrlandDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error listing Drive files:', err);
      setFileError(err.message || 'Failed to fetch Google Drive files');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setFileError(null);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      // PopupBlockedModal will show if popup was blocked
      if (err?.code !== 'auth/popup-blocked') {
        setFileError(err.message || 'Gagal masuk dengan akun Google.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleSignOut();
    setUser(null);
    setToken(null);
    setDriveFiles([]);
  };

  const handleBackupAll = async () => {
    if (!token) {
      setFileError('Silakan hubungkan akun Google Drive Anda terlebih dahulu.');
      return;
    }

    setIsBackingUp(true);
    try {
      await saveComcardsBackupToDrive(token, comcards);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 4000);
      loadFiles(token);
    } catch (err: any) {
      console.error('Backup error:', err);
      setFileError(`Backup gagal: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setIsUploadingPhoto(true);
    setUploadSuccessMessage(null);
    try {
      const safeName = `Orland_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const res = await uploadModelPhotoToDrive(token, file, safeName);
      setUploadSuccessMessage(`Berhasil diunggah ke Google Drive: ${res.name}`);
      setTimeout(() => setUploadSuccessMessage(null), 4000);
      loadFiles(token);
    } catch (err: any) {
      console.error('Upload to Drive failed:', err);
      setFileError(`Upload gagal: ${err.message}`);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Explicit confirmation required for file deletion
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !token) return;

    setIsDeleting(true);
    try {
      await deleteDriveFile(token, fileToDelete.id);
      setDriveFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setFileError(`Gagal menghapus file: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <FileImage className="w-5 h-5 text-amber-600" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-600" />;
    if (mimeType.includes('json')) return <FileCode className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-zinc-500" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '—';
    const num = parseInt(bytes, 10);
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#FAF9F5]">
      {/* Top Header */}
      <header className="flex justify-between items-center h-20 px-8 lg:px-12 w-full z-30 bg-[#FAF9F5] border-b border-[#E7E5E0] sticky top-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-display font-medium text-[#171717] flex items-center gap-2.5">
            <HardDrive className="w-7 h-7 text-[#C9A227]" /> Google Drive Cloud Storage
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Orland Management dedicated cloud sync for comcards and model media
          </p>
        </div>

        <div>
          {token && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 bg-white border border-[#E7E5E0] px-3 py-1.5 rounded-full shadow-2xs">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                    {user.displayName?.[0] || 'U'}
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#171717] leading-none">
                    {user.displayName || 'Google Account'}
                  </div>
                  <div className="text-[10px] text-[#6B6B6B] font-mono leading-none mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 border border-[#E7E5E0] hover:border-red-400 text-[#6B6B6B] hover:text-red-600 rounded-full transition-colors"
                title="Disconnect Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main Container */}
      <div className="p-8 lg:p-12 max-w-6xl mx-auto w-full space-y-8 flex-1">
        {/* Auth Banner if not signed in */}
        {!token ? (
          <div className="bg-white border border-[#E7E5E0] rounded-2xl p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                <Lock className="w-3.5 h-3.5" /> Google Drive Permission Required
              </div>
              <h2 className="text-xl font-bold font-serif-display text-[#171717]">
                Connect your Google Drive with Orland Management
              </h2>
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                Connect your Google account to automatically store high-resolution Comcard exports, model portfolio photos, and backup data in your personal Google Drive under the <strong>Orland Management</strong> folder.
              </p>
            </div>

            {/* Auth Actions: GSI button + Open in new tab option */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-[#747775] hover:bg-[#F8F9FA] rounded-full text-xs font-medium text-[#1F1F1F] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>

              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-[#171717] hover:bg-black text-white rounded-full text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
                title="Buka di tab baru agar otorisasi pop-up berjalan mulus tanpa restriksi browser"
              >
                <ExternalLink className="w-4 h-4 text-[#D4A737]" />
                <span>Buka di Tab Baru</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* File / Auth Error Notice */}
        {fileError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{fileError}</span>
            </div>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="text-[11px] font-bold text-[#171717] underline hover:no-underline flex items-center gap-1 shrink-0"
            >
              Buka di Tab Baru <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Directory Folder Structure Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>📁 Orland Management / Comcards</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
              Stores all exported PNG, JPG, and 300 DPI PDF talent comcard comp sheets ready for agency casting submissions.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>📁 Orland Management / Model Photos</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
              Backs up original uncropped high-resolution photography, polaroids, and editorial session shots.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#171717]">
              <Folder className="w-4 h-4 text-amber-500" />
              <span>📁 Orland Management / Backups</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
              JSON format snapshots of your talent roster measurements, agency contacts, and custom layouts.
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E7E5E0] shadow-2xs">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBackupAll}
              disabled={!token || isBackingUp}
              className="px-4 py-2 bg-[#171717] hover:bg-black text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <FolderSync className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
              {isBackingUp ? 'Syncing to Drive...' : 'Backup All Comcards to Drive'}
            </button>

            {token && (
              <label className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer">
                <Upload className={`w-4 h-4 ${isUploadingPhoto ? 'animate-spin' : ''}`} />
                <span>{isUploadingPhoto ? 'Uploading to Drive...' : 'Upload File to Drive Backend'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  disabled={isUploadingPhoto}
                  className="hidden"
                />
              </label>
            )}

            {backupSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> JSON Snapshot saved to Google Drive!
              </span>
            )}

            {uploadSuccessMessage && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> {uploadSuccessMessage}
              </span>
            )}
          </div>

          {token && (
            <button
              onClick={() => loadFiles(token)}
              disabled={isLoadingFiles}
              className="px-3.5 py-2 border border-[#E7E5E0] hover:border-[#171717] rounded-xl text-xs font-medium text-[#171717] flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              Refresh Drive Files
            </button>
          )}
        </div>

        {/* Files Explorer Table */}
        <div className="bg-white rounded-2xl border border-[#E7E5E0] shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7E5E0] flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#C9A227]" /> Files in Orland Management Drive
            </h3>
            <span className="text-xs font-mono text-[#6B6B6B]">
              {driveFiles.length} file{driveFiles.length === 1 ? '' : 's'} found
            </span>
          </div>

          {!token ? (
            <div className="p-12 text-center text-xs text-[#6B6B6B]">
              Please sign in with Google above to view and manage files in your Google Drive.
            </div>
          ) : isLoadingFiles ? (
            <div className="p-12 text-center text-xs text-[#6B6B6B] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C9A227]" />
              Reading files from Google Drive...
            </div>
          ) : fileError ? (
            <div className="p-8 text-center text-xs text-red-600 flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{fileError}</span>
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-xs text-[#6B6B6B]">
                No files uploaded to your Orland Management folder yet.
              </p>
              <p className="text-[11px] text-[#888888]">
                Export any Comcard from the Editor or Showcase to save it straight to Google Drive!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#FAF9F5] text-[#6B6B6B] font-mono text-[10px] uppercase border-b border-[#E7E5E0]">
                    <th className="py-3 px-6">File Name</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4">Uploaded</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {driveFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3.5 px-6 font-medium text-[#171717] flex items-center gap-3">
                        {getFileIcon(file.mimeType)}
                        <span className="truncate max-w-xs sm:max-w-md">{file.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6B6B6B]">
                        {formatFileSize(file.size)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#6B6B6B]">
                        {file.createdTime
                          ? new Date(file.createdTime).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-[#E7E5E0] hover:border-[#171717] rounded-lg text-xs font-semibold text-[#171717] transition-colors"
                          >
                            Open in Drive <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          onClick={() => setFileToDelete(file)}
                          className="inline-flex items-center p-1.5 text-[#6B6B6B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#171717]">Delete file from Google Drive?</h3>
            </div>

            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Are you sure you want to permanently delete <strong>{fileToDelete.name}</strong> from your Google Drive? This action cannot be undone.
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#E7E5E0] rounded-xl text-xs font-medium text-[#6B6B6B] hover:text-[#171717]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
