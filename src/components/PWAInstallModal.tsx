import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Share2,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center p-2.5 shadow-lg shadow-teal-950/40">
              <img src="/pwa-192x192.png" alt="OrthoLog Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Install OrthoLog App</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Android APK & PWA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Install as a dedicated, standalone application on your Android phone, tablet, or desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        {isInstalled ? (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-teal-950/40 border border-teal-700/50 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-teal-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-teal-200">Already Installed!</div>
              <div className="text-xs text-teal-300/80">
                OrthoLog is currently running as a standalone application on this device.
              </div>
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Quick Install Action if browser supports one-click prompt */}
          {isInstallable && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-teal-900/40 to-slate-800/80 border border-teal-500/30 shadow-inner">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="font-semibold text-white flex items-center gap-2 justify-center sm:justify-start">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    One-Click Android APK Installation
                  </div>
                  <div className="text-xs text-slate-300">
                    Chrome will automatically build and install the native WebAPK directly onto your device launcher.
                  </div>
                </div>
                <button
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {installing ? 'Installing...' : 'Install APK Now'}
                </button>
              </div>
            </div>
          )}

          {/* OS Tabs */}
          <div>
            <div className="flex border-b border-slate-800 gap-2 mb-4">
              <button
                onClick={() => setActiveTab('android')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'android'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Android (WebAPK / Standalone)
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'ios'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                iPhone / iPad (iOS)
              </button>
              <button
                onClick={() => setActiveTab('desktop')}
                className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                  activeTab === 'desktop'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Download className="w-4 h-4" />
                Desktop (Chrome / Edge)
              </button>
            </div>

            {/* Tab content: Android */}
            {activeTab === 'android' && (
              <div className="space-y-4">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-3">
                  <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">1</span>
                    Direct Installation via Chrome on Android:
                  </div>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 ml-2 leading-relaxed">
                    <li>Open this OrthoLog link on your Android device in <strong>Google Chrome</strong>.</li>
                    <li>
                      Tap the <strong>three dots menu (⋮)</strong> at the top right of Chrome.
                    </li>
                    <li>
                      Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </li>
                    <li>
                      Android will generate and install a native <strong>WebAPK</strong> file. OrthoLog will now appear in your Android <strong>App Drawer</strong> and <strong>Home Screen</strong> with its own icon, isolated storage, and full-screen window (no browser address bars)!
                    </li>
                  </ol>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-2">
                  <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                    Generating a raw .APK for sideloading / Play Store:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Because OrthoLog conforms to all PWA and Web Manifest standards with 192px/512px maskable icons, you can also package it into a raw installable Android APK file using official tools:
                  </p>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 ml-2">
                    <li>
                      <strong>PWABuilder:</strong> Visit <code className="bg-slate-900 px-1.5 py-0.5 rounded text-teal-300">pwabuilder.com</code>, enter this app's URL, and click <strong>"Generate Android APK / AAB"</strong>.
                    </li>
                    <li>
                      <strong>Google Bubblewrap CLI:</strong> Google's official CLI tool that turns compliant PWAs into signed Android APK binaries with Android Studio / Gradle.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab content: iOS */}
            {activeTab === 'ios' && (
              <div className="space-y-4">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-3">
                  <div className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-teal-400" />
                    How to install on iPhone & iPad (Safari):
                  </div>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 ml-2 leading-relaxed">
                    <li>Open this page in <strong>Safari</strong> on your iPhone or iPad.</li>
                    <li>Tap the <strong>Share</strong> button (the square with an arrow pointing up at the bottom).</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> in the top right.</li>
                    <li>OrthoLog will launch as a full-screen, native-like iOS application from your home screen.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Tab content: Desktop */}
            {activeTab === 'desktop' && (
              <div className="space-y-4">
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 space-y-3">
                  <div className="font-semibold text-slate-200 text-sm">
                    How to install on Windows, Mac, or Chromebook:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    In Chrome or Microsoft Edge, look for the <strong>Install icon</strong> in the right side of the address bar (looks like a monitor with a down arrow). Click it and select <strong>"Install"</strong> to launch OrthoLog as an independent desktop window with its own taskbar shortcut!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Benefits summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <Shield className="w-4 h-4 text-teal-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200">Standalone App</div>
              <div className="text-[11px] text-slate-400">Zero browser chrome or address bars</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <Layers className="w-4 h-4 text-blue-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200">Offline & Fast</div>
              <div className="text-[11px] text-slate-400">IndexedDB local storage for OR logs</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <ExternalLink className="w-4 h-4 text-purple-400 mb-1" />
              <div className="text-xs font-semibold text-slate-200">Google Drive Sync</div>
              <div className="text-[11px] text-slate-400">Backup your logs & DICOM images</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">OrthoLog Medical PWA v1.2</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
