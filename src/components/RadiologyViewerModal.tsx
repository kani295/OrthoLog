import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  Eye,
  Columns,
  Maximize2,
  Calendar,
  FileText,
  Play,
  Pause,
  Film,
  Repeat,
  SkipForward,
  SkipBack,
  SidebarClose,
  SidebarOpen,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CaseAttachment } from '../types/ortho';
import { isAttachmentVideo } from '../utils/media';

interface Props {
  attachments: CaseAttachment[];
  initialIndex?: number;
  onClose: () => void;
  patientName?: string;
  procedureName?: string;
}

export const RadiologyViewerModal: React.FC<Props> = ({
  attachments,
  initialIndex = 0,
  onClose,
  patientName,
  procedureName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [compareIndex, setCompareIndex] = useState<number | null>(
    attachments.length > 1 ? (initialIndex === 0 ? 1 : 0) : null
  );
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Imaging adjustment controls
  const [zoom, setZoom] = useState(1);
  const [contrast, setContrast] = useState(115);
  const [brightness, setBrightness] = useState(105);
  const [invert, setInvert] = useState(false);
  const [windowPreset, setWindowPreset] = useState<'standard' | 'bone' | 'softTissue'>('standard');

  // Video specific controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentItem = attachments[currentIndex] || attachments[0];
  const compareItem = compareIndex !== null ? attachments[compareIndex] : null;
  const currentIsVideo = currentItem ? isAttachmentVideo(currentItem) : false;

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
  }, [currentIndex]);

  if (!currentItem) return null;

  const handleApplyPreset = (preset: 'standard' | 'bone' | 'softTissue') => {
    setWindowPreset(preset);
    if (preset === 'bone') {
      // Bone window: High contrast for cortical margins, trabeculae, implants
      setContrast(165);
      setBrightness(95);
      setInvert(false);
    } else if (preset === 'softTissue') {
      // Soft tissue window: Lower contrast, elevated brightness for muscle, effusion, fat planes
      setContrast(85);
      setBrightness(130);
      setInvert(false);
    } else {
      // Standard
      setContrast(115);
      setBrightness(105);
      setInvert(false);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setContrast(100);
    setBrightness(100);
    setInvert(false);
    setWindowPreset('standard');
    setPlaybackSpeed(1);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stepFrame = (forward = true) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const step = 0.05;
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + (forward ? step : -step));
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const filterStyle: React.CSSProperties = {
    filter: `contrast(${contrast}%) brightness(${brightness}%) ${invert ? 'invert(1)' : ''}`,
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
    transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Header Toolbar - Responsive with horizontal scroll prevention and high contrast buttons */}
      <header className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-900/95 gap-2 shrink-0 z-20">
        {/* Left: Patient info & Series name */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            {currentIsVideo ? <Film className="w-3.5 h-3.5 text-teal-400" /> : <Layers className="w-3.5 h-3.5 text-teal-400" />}
            <span>{currentIsVideo ? 'CT Cine / Video' : 'Orthopedic PACS'}</span>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 truncate">
              <span className="truncate">{patientName || 'Patient Imaging'}</span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-400 font-normal truncate hidden sm:inline">{procedureName || 'Radiographs'}</span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2 truncate mt-0.5">
              <span className="text-teal-400 font-semibold">{currentItem.category}</span>
              <span>·</span>
              <span className="font-mono text-slate-300 truncate">{currentItem.name}</span>
            </p>
          </div>
        </div>

        {/* Right: PACS Controls with wrapping for small screens */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Window Presets: Prominently featured so Soft Tissue Window is 100% accessible */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs shrink-0 shadow-inner">
            <button
              onClick={() => handleApplyPreset('standard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                windowPreset === 'standard'
                  ? 'bg-teal-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleApplyPreset('bone')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                windowPreset === 'bone'
                  ? 'bg-teal-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Bone Window: Enhanced contrast for trabeculae and cortices"
            >
              🦴 Bone Window
            </button>
            <button
              onClick={() => handleApplyPreset('softTissue')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                windowPreset === 'softTissue'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow ring-2 ring-amber-400/40'
                  : 'text-amber-300 hover:text-white hover:bg-amber-500/20'
              }`}
              title="Soft Tissue Window: Low contrast, high brightness for tissue/effusion"
            >
              🥩 Soft Tissue Window
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 shrink-0" />

          {/* Invert */}
          <button
            onClick={() => setInvert(!invert)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              invert
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Invert radiograph polarity"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Invert</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-slate-300 min-w-[46px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3.5, +(z + 0.25).toFixed(2)))}
              className="p-1.5 hover:text-white text-slate-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
            title="Reset display parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {attachments.length > 1 && (
            <button
              onClick={() => setIsCompareMode(!isCompareMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                isCompareMode
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          )}

          {/* Sidebar Toggle Button to view 100% of the right-side data without obstruction */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
              isSidebarOpen
                ? 'bg-slate-800 text-teal-300 border-teal-500/30'
                : 'bg-teal-600 text-white border-teal-500'
            }`}
            title="Toggle Right Series Sidebar"
          >
            {isSidebarOpen ? <SidebarClose className="w-3.5 h-3.5" /> : <SidebarOpen className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Sidebar' : 'Show Series'}</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 shrink-0" />

          {/* Close modal */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-xl border border-transparent hover:border-rose-500/30 transition shrink-0 cursor-pointer"
            title="Close PACS Viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main PACS Viewport and Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Display Area: supports pan & scroll so right-side anatomy is fully accessible */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 overflow-auto relative bg-black min-w-0">
          {isCompareMode && compareItem ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full min-h-[400px]">
              {/* Primary Item */}
              <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex justify-between text-xs items-center">
                  <span className="font-semibold text-teal-400">{currentItem.category}</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{currentItem.name}</span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-auto p-2 relative bg-black">
                  {currentIsVideo ? (
                    <video
                      src={currentItem.dataUrl}
                      controls
                      autoPlay
                      loop
                      style={filterStyle}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <img
                      src={currentItem.dataUrl}
                      alt={currentItem.name}
                      style={filterStyle}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Compare Item */}
              <div className="flex flex-col border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                <div className="bg-slate-900/90 px-3 py-2 border-b border-slate-800 flex justify-between text-xs items-center">
                  <span className="font-semibold text-amber-400">{compareItem.category}</span>
                  <select
                    value={compareIndex ?? 0}
                    onChange={(e) => setCompareIndex(Number(e.target.value))}
                    className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-lg border border-slate-700"
                  >
                    {attachments.map((att, i) => (
                      <option key={att.id} value={i}>
                        {att.category} - {att.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-auto p-2 relative bg-black">
                  {isAttachmentVideo(compareItem) ? (
                    <video
                      src={compareItem.dataUrl}
                      controls
                      autoPlay
                      loop
                      style={filterStyle}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <img
                      src={compareItem.dataUrl}
                      alt={compareItem.name}
                      style={filterStyle}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center overflow-auto relative p-2">
              {currentIsVideo ? (
                <video
                  ref={videoRef}
                  src={currentItem.dataUrl}
                  autoPlay
                  loop={isLooping}
                  playsInline
                  onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
                  onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration)}
                  style={filterStyle}
                  className="max-h-full max-w-full object-contain select-none"
                />
              ) : (
                <img
                  src={currentItem.dataUrl}
                  alt={currentItem.name}
                  style={filterStyle}
                  className="max-h-full max-w-full object-contain select-none"
                />
              )}

              {/* Top-left HUD parameters */}
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-xs font-mono text-slate-300 shadow-xl pointer-events-none z-10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-400 uppercase">{windowPreset} Window</span>
                  <span className="text-slate-600">|</span>
                  <span>Contrast: {contrast}%</span>
                  <span className="text-slate-600">|</span>
                  <span>Brightness: {brightness}%</span>
                  <span className="text-slate-600">|</span>
                  <span>Zoom: {Math.round(zoom * 100)}%</span>
                </div>
                {currentItem.notes && (
                  <div className="mt-1 text-slate-300 font-sans text-[11px] max-w-xs">{currentItem.notes}</div>
                )}
              </div>
            </div>
          )}

          {/* Floating On-Screen Quick Window Control Bar (Always accessible right over the image) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-2xl flex flex-wrap items-center gap-2 z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Window Presets:
            </span>
            <button
              onClick={() => handleApplyPreset('standard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                windowPreset === 'standard' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => handleApplyPreset('bone')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                windowPreset === 'bone' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🦴 Bone Window
            </button>
            <button
              onClick={() => handleApplyPreset('softTissue')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                windowPreset === 'softTissue'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
              }`}
            >
              🥩 Soft Tissue Window
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

            {/* Quick Contrast Adjusters */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 hidden md:inline">Contrast:</span>
              <button
                onClick={() => setContrast((c) => Math.max(40, c - 15))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                title="Decrease Contrast"
              >
                -
              </button>
              <span className="font-mono text-[11px] text-slate-300 min-w-[32px] text-center">{contrast}%</span>
              <button
                onClick={() => setContrast((c) => Math.min(240, c + 15))}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                title="Increase Contrast"
              >
                +
              </button>
            </div>
          </div>

          {/* Video Dedicated Cine Playbar */}
          {currentIsVideo && !isCompareMode && (
            <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur border border-slate-800 rounded-2xl p-3 mb-16 flex items-center gap-3 text-xs z-10 shadow-2xl">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => stepFrame(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Previous Frame"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => stepFrame(true)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Next Frame"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              {/* Scrubber */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={(e) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Number(e.target.value);
                    setCurrentTime(Number(e.target.value));
                  }
                }}
                className="flex-1 accent-teal-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />

              <span className="font-mono text-slate-400 min-w-[70px] text-right">
                {currentTime.toFixed(1)}s / {duration ? `${duration.toFixed(1)}s` : '0.0s'}
              </span>

              {/* Speed choices */}
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={`px-2 py-0.5 text-[10px] rounded transition ${
                      playbackSpeed === s ? 'bg-teal-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Loop toggle */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-1.5 rounded-lg transition ${
                  isLooping ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle continuous cine loop"
              >
                <Repeat className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Collapsible Right Sidebar: Series, Thumbnails & Sliders */}
        {isSidebarOpen && (
          <aside className="w-80 max-w-[85vw] border-l border-slate-800 bg-slate-900/95 flex flex-col shrink-0 z-10 transition-all duration-200">
            <div className="p-3 border-b border-slate-800 font-medium text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="font-semibold text-white">Series & Media ({attachments.length})</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Collapse sidebar to view full image width"
              >
                <SidebarClose className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnails series list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {attachments.map((att, idx) => {
                const isSelected = idx === currentIndex;
                const isVid = isAttachmentVideo(att);
                return (
                  <div
                    key={att.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex flex-col gap-2 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/10 shadow-md'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 relative">
                      {isVid ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-teal-400">
                          <Film className="w-8 h-8" />
                          <span className="text-[10px] font-mono mt-1 text-slate-400">Cine Video</span>
                        </div>
                      ) : (
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                      {isVid && (
                        <div className="absolute top-1.5 right-1.5 bg-teal-600 text-white rounded p-1 shadow">
                          <Play className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{att.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{att.dateAdded}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">{att.name}</p>
                      {att.notes && (
                        <p className="text-[11px] text-teal-400 line-clamp-2 mt-1">{att.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sliders panel & Presets in Sidebar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3 text-xs">
              <div className="font-semibold text-slate-300 text-xs flex items-center justify-between">
                <span>Display Adjustment</span>
                <button
                  onClick={handleReset}
                  className="text-[11px] text-teal-400 hover:text-teal-300"
                >
                  Reset
                </button>
              </div>

              {/* Soft tissue preset button in sidebar */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleApplyPreset('bone')}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-semibold text-center transition ${
                    windowPreset === 'bone'
                      ? 'bg-teal-600 text-white border-teal-500'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Bone Window
                </button>
                <button
                  onClick={() => handleApplyPreset('softTissue')}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-bold text-center transition ${
                    windowPreset === 'softTissue'
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  Soft Tissue
                </button>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contrast</span>
                  <span className="font-mono text-slate-300">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="240"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Brightness</span>
                  <span className="font-mono text-slate-300">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
