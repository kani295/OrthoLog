import React, { useEffect, useState } from 'react';
import {
  Scissors,
  ClipboardList,
  BarChart3,
  FileText,
  Cloud,
  Plus,
  ShieldCheck,
  Smartphone,
  Download,
  Upload,
} from 'lucide-react';
import { getAccessToken } from '../services/firebaseAuth';

interface Props {
  activeTab: 'cases' | 'analytics' | 'summary';
  setActiveTab: (tab: 'cases' | 'analytics' | 'summary') => void;
  onOpenNewCase: () => void;
  onOpenDriveModal: () => void;
  onOpenInstallModal: () => void;
  onExportJson?: () => void;
  onImportJson?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  caseCount: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenNewCase,
  onOpenDriveModal,
  onOpenInstallModal,
  onExportJson,
  onImportJson,
  caseCount,
}) => {
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  useEffect(() => {
    const checkDrive = async () => {
      const token = await getAccessToken();
      setIsDriveConnected(!!token);
    };
    checkDrive();
    const interval = setInterval(checkDrive, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 print:hidden shadow-lg shadow-slate-950/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Tier 1: Brand Logo & Top Actions Cluster - Flex-wrapped, accessible on all screen sizes */}
        <div className="flex flex-wrap items-center justify-between py-2 sm:py-2.5 gap-2 border-b border-slate-800/70">
          {/* Logo & Clinical Brand */}
          <div
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('cases')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-950 font-bold border border-teal-400/30 shrink-0">
              <Scissors className="w-4 h-4 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">OrthoLog</span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  SURGICAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Orthopedic Surgeon Logbook & Quality Audit
              </p>
            </div>
          </div>

          {/* Action Tools Cluster: Fully accessible, wraps cleanly without any horizontal scroll */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Google Drive Status Button */}
            <button
              onClick={onOpenDriveModal}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                isDriveConnected
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title="Google Drive Cloud Backup & Sync"
            >
              <Cloud className={`w-3.5 h-3.5 ${isDriveConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                {isDriveConnected ? 'Drive Connected' : 'Google Drive'}
              </span>
              <span className="sm:hidden">Drive</span>
              {isDriveConnected && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
            </button>

            {/* Install App / APK Button */}
            <button
              onClick={onOpenInstallModal}
              className="px-2.5 py-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Install as Android APK or Standalone App"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Install App (APK)</span>
              <span className="sm:hidden">Install</span>
            </button>

            {/* Quick JSON Backup Button */}
            {onExportJson && (
              <button
                onClick={onExportJson}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold items-center gap-1.5 transition cursor-pointer"
                title="Download JSON Backup of all cases"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Backup</span>
              </button>
            )}

            {/* Quick JSON Import */}
            {onImportJson && (
              <label
                className="hidden lg:flex px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold items-center gap-1.5 transition cursor-pointer"
                title="Restore cases from JSON Backup file"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Restore</span>
                <input type="file" accept=".json" onChange={onImportJson} className="hidden" />
              </label>
            )}

            {/* Primary Action Button: Log Surgery */}
            <button
              onClick={onOpenNewCase}
              className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-950 transition active:scale-95 cursor-pointer shrink-0"
              title="Log a new surgical case"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Surgery</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Navigation Tabs - cleanly organized across all viewports */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 sm:py-2 gap-1.5">
          <nav className="grid grid-cols-3 sm:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('cases')}
              className={`py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === 'cases'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Logbook</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/90 font-mono shrink-0">
                {caseCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === 'analytics'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                activeTab === 'summary'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Summary</span>
            </button>
          </nav>

          {/* Quick Context & Quality Governance Status */}
          <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Offline Ready</span>
            </span>
            <span className="text-slate-700">·</span>
            <span>Local Encrypted</span>
            <span className="text-slate-700">·</span>
            <span>Morbidity & Quality Audit</span>
          </div>
        </div>
      </div>
    </header>
  );
};
