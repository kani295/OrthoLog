import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Trash2,
  FileSpreadsheet,
  FileCode,
  RefreshCw,
  LogOut,
  FolderOpen,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { SurgicalCase } from '../types/ortho';
import {
  googleSignIn,
  logout,
  getAccessToken,
  getCurrentUser,
} from '../services/firebaseAuth';
import {
  saveCasesBackupToDrive,
  saveCsvToDrive,
  listDriveBackups,
  downloadBackupCasesFromDrive,
  deleteDriveFile,
  DriveFileItem,
} from '../services/googleDrive';

interface Props {
  cases: SurgicalCase[];
  onRestoreCases: (cases: SurgicalCase[]) => void;
  onClose: () => void;
}

export const GoogleDriveSyncModal: React.FC<Props> = ({
  cases,
  onRestoreCases,
  onClose,
}) => {
  const [user, setUser] = useState(getCurrentUser());
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);

  // Confirmation modal state for destructive operations
  const [pendingConfirm, setPendingConfirm] = useState<{
    action: () => Promise<void>;
    title: string;
    description: string;
    confirmText: string;
    danger?: boolean;
  } | null>(null);

  useEffect(() => {
    checkTokenState();
  }, []);

  const checkTokenState = async () => {
    const token = await getAccessToken();
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setHasToken(!!token);
    if (token) {
      loadDriveBackupsList();
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasToken(true);
        setStatusMessage({ text: 'Signed in with Google successfully!', type: 'success' });
        loadDriveBackupsList();
      } else {
        // User closed or dismissed popup without signing in
        setStatusMessage(null);
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        setStatusMessage(null);
        return;
      }

      let message = 'Failed to sign in with Google.';
      if (err?.code === 'auth/popup-blocked') {
        message = 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (err?.code === 'auth/network-request-failed') {
        message = 'Network connection error. Please check your internet connection.';
      } else if (err?.message) {
        message = err.message;
      }

      setStatusMessage({
        text: message,
        type: 'error',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setHasToken(false);
    setDriveFiles([]);
    setStatusMessage({ text: 'Signed out of Google account.', type: 'info' });
  };

  const loadDriveBackupsList = async () => {
    try {
      setIsLoading(true);
      const files = await listDriveBackups();
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Could not list drive backups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupToDrive = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const file = await saveCasesBackupToDrive(cases);
      setStatusMessage({
        text: `Successfully backed up ${cases.length} surgical cases to Google Drive as "${file.name}"!`,
        type: 'success',
      });
      loadDriveBackupsList();
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to backup logbook to Google Drive.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsvToDrive = async () => {
    try {
      setIsLoading(true);
      setStatusMessage(null);
      const file = await saveCsvToDrive(cases);
      setStatusMessage({
        text: `Exported CSV table to Google Drive as "${file.name}"!`,
        type: 'success',
      });
      loadDriveBackupsList();
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to export CSV to Google Drive.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const promptRestoreFromDrive = (file: DriveFileItem) => {
    setPendingConfirm({
      title: 'Restore Surgical Logbook from Backup?',
      description: `This will import records from "${file.name}" into your local database. Existing records with matching IDs will be updated. Proceed with restore?`,
      confirmText: 'Restore Records',
      danger: false,
      action: async () => {
        setIsLoading(true);
        try {
          const loadedCases = await downloadBackupCasesFromDrive(file.id);
          onRestoreCases(loadedCases);
          setStatusMessage({
            text: `Successfully restored ${loadedCases.length} surgical cases from Google Drive backup!`,
            type: 'success',
          });
        } catch (err: any) {
          setStatusMessage({
            text: err?.message || 'Failed to download or restore backup from Drive.',
            type: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const promptDeleteDriveFile = (file: DriveFileItem) => {
    setPendingConfirm({
      title: `Delete File from Google Drive?`,
      description: `Are you sure you want to delete "${file.name}" from your Google Drive? This action cannot be undone.`,
      confirmText: 'Delete from Drive',
      danger: true,
      action: async () => {
        setIsLoading(true);
        try {
          await deleteDriveFile(file.id);
          setStatusMessage({
            text: `File "${file.name}" was permanently removed from Google Drive.`,
            type: 'info',
          });
          loadDriveBackupsList();
        } catch (err: any) {
          setStatusMessage({
            text: err?.message || 'Failed to delete file from Google Drive.',
            type: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Drive Integration</h2>
              <p className="text-xs text-slate-400">
                Securely store, back up, and synchronize your orthopedic logbook to your Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-sm flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                  : 'bg-sky-950/60 border-sky-500/30 text-sky-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* Account Status Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {hasToken && user ? (
              <div className="flex items-center space-x-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-teal-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'Dr')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {user.displayName || 'Orthopedic Surgeon'}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Connected
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold text-white text-sm">Connect Google Account</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sign in to grant permission to save surgical records directly to your Google Drive.
                </p>
              </div>
            )}

            <div>
              {hasToken && user ? (
                <button
                  onClick={handleSignOut}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              ) : (
                /* Standard Google Sign-In button per workspace integration skill guidelines */
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-medium text-sm rounded-lg shadow-sm border border-slate-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
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
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sync & Save Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBackupToDrive}
                disabled={!hasToken || isLoading}
                className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-left transition disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold text-sm">
                    <Upload className="w-4 h-4" />
                    <span>Backup Database to Drive</span>
                  </div>
                  <FileCode className="w-4 h-4 text-teal-400/60" />
                </div>
                <p className="text-xs text-slate-300">
                  Upload current {cases.length} cases (notes, implants, complications, and attachments) as a timestamped backup JSON into "OrthoLog - Surgical Records".
                </p>
              </button>

              <button
                onClick={handleExportCsvToDrive}
                disabled={!hasToken || isLoading}
                className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-left transition disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 text-sky-300 font-semibold text-sm">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Save Spreadsheet (CSV)</span>
                  </div>
                  <Cloud className="w-4 h-4 text-sky-400/60" />
                </div>
                <p className="text-xs text-slate-300">
                  Save all cases as a formatted tabular CSV file into Google Drive for viewing in Google Sheets or Excel.
                </p>
              </button>
            </div>
          </div>

          {/* Drive Files List */}
          {hasToken && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    "OrthoLog - Surgical Records" in Google Drive
                  </h3>
                </div>
                <button
                  onClick={loadDriveBackupsList}
                  disabled={isLoading}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/60">
                {driveFiles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No files found in your OrthoLog Drive folder yet. Click "Backup Database" above to create your first save.
                  </div>
                ) : (
                  driveFiles.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 px-4 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {f.name.endsWith('.csv') ? (
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <FileCode className="w-4 h-4 text-teal-400 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">{f.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Modified: {new Date(f.modifiedTime).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {f.name.endsWith('.json') && (
                          <button
                            onClick={() => promptRestoreFromDrive(f)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition flex items-center gap-1"
                            title="Restore records from this file"
                          >
                            <Download className="w-3 h-3" />
                            Restore
                          </button>
                        )}
                        {f.webViewLink && (
                          <a
                            href={f.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-sky-300 hover:bg-slate-800 rounded transition"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => promptDeleteDriveFile(f)}
                          disabled={isLoading}
                          className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                          title="Delete file from Google Drive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Local Database: {cases.length} cases stored</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      {pendingConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${
                  pendingConfirm.danger
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                }`}
              >
                {pendingConfirm.danger ? <AlertCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-bold text-white">{pendingConfirm.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{pendingConfirm.description}</p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setPendingConfirm(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const act = pendingConfirm.action;
                  setPendingConfirm(null);
                  await act();
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition ${
                  pendingConfirm.danger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {pendingConfirm.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
