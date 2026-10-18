import React, { useState } from 'react';
import {
  X,
  Calendar,
  User,
  Clock,
  Droplet,
  Timer,
  AlertTriangle,
  Activity,
  Edit,
  Trash2,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Stethoscope,
  Scissors,
  Maximize2,
} from 'lucide-react';
import { SurgicalCase } from '../types/ortho';
import { RadiologyViewerModal } from './RadiologyViewerModal';

interface Props {
  surgicalCase: SurgicalCase;
  onEdit: (c: SurgicalCase) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const CaseDetailModal: React.FC<Props> = ({
  surgicalCase,
  onEdit,
  onDelete,
  onClose,
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);

  const openViewerAt = (idx: number) => {
    setViewerStartIndex(idx);
    setViewerOpen(true);
  };

  const confirmDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the surgical record for ${surgicalCase.patientName} (${surgicalCase.procedureName})?`
      )
    ) {
      onDelete(surgicalCase.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{surgicalCase.patientName}</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Hospital ID: {surgicalCase.hospitalId || surgicalCase.mrn}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {surgicalCase.age}y / {surgicalCase.gender}
                </span>
              </div>
              <p className="text-xs text-teal-300 font-semibold mt-0.5">
                {surgicalCase.procedureName} ({surgicalCase.laterality})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(surgicalCase)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
              title="Edit Case"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={confirmDelete}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition flex items-center gap-1.5 text-xs font-medium"
              title="Delete Case"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                Surgery Date
              </div>
              <div className="text-sm font-semibold text-white mt-1 font-mono">
                {surgicalCase.surgeryDate}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Duration
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {surgicalCase.durationMinutes ? `${surgicalCase.durationMinutes} min` : 'Not recorded'}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-rose-400" />
                Blood Loss (EBL)
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {surgicalCase.estimatedBloodLossMl ? `${surgicalCase.estimatedBloodLossMl} mL` : 'Not recorded'}
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-400" />
                Tourniquet
              </div>
              <div className="text-sm font-semibold text-white mt-1">
                {surgicalCase.tourniquetMinutes ? `${surgicalCase.tourniquetMinutes} min` : 'None'}
              </div>
            </div>
          </div>

          {/* Safety Alerts: Complications and Infections */}
          {(surgicalCase.hasComplication || surgicalCase.hasInfection) && (
            <div className="space-y-3">
              {surgicalCase.hasComplication && surgicalCase.complicationDetails && (
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      COMPLICATION RECORDED: {surgicalCase.complicationDetails.type}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                        {surgicalCase.complicationDetails.timing}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 font-semibold">
                        {surgicalCase.complicationDetails.severity}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-amber-100/90 leading-relaxed">
                    <strong>Findings:</strong> {surgicalCase.complicationDetails.description}
                  </div>
                  <div className="text-xs text-amber-100/90 leading-relaxed">
                    <strong>Management & Corrective Action:</strong> {surgicalCase.complicationDetails.management}
                  </div>
                </div>
              )}

              {surgicalCase.hasInfection && surgicalCase.infectionDetails && (
                <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                      <Activity className="w-4 h-4 text-rose-400" />
                      SURGICAL SITE INFECTION: {surgicalCase.infectionDetails.type}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-xs font-mono">
                      Onset: {surgicalCase.infectionDetails.onsetDaysPostOp} days post-op
                    </span>
                  </div>
                  <div className="text-xs text-rose-100/90">
                    <strong>Organism:</strong> {surgicalCase.infectionDetails.organism || 'Culture Negative / Pending'}
                  </div>
                  <div className="text-xs text-rose-100/90">
                    <strong>Treatment Regimen:</strong> {surgicalCase.infectionDetails.treatment}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Diagnostic & Surgical Specs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-teal-400" />
                Procedure & Diagnosis
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Diagnosis:</span>
                  <p className="text-white font-medium mt-0.5">{surgicalCase.diagnosis}</p>
                </div>
                <div>
                  <span className="text-slate-400">Subspecialty:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{surgicalCase.procedureCategory}</p>
                </div>
                <div>
                  <span className="text-slate-400">Surgical Approach:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{surgicalCase.surgicalApproach || 'Standard'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Anesthesia:</span>
                  <p className="text-slate-200 font-medium mt-0.5">{surgicalCase.anesthesia}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                Hardware & Implants
              </h3>
              <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800 min-h-[90px]">
                {surgicalCase.implants || 'No hardware or implants documented.'}
              </div>
            </div>
          </div>

          {/* Postoperative Notes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Postoperative Notes & Regimen
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
              {surgicalCase.postOpNotes}
            </p>
          </div>

          {/* Special Notes */}
          {surgicalCase.specialNotes && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                Special Notes & Clinical Pearls
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {surgicalCase.specialNotes}
              </p>
            </div>
          )}

          {/* Imaging & Reports Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                Patient Imaging, CT Videos & Radiographs ({surgicalCase.attachments.length})
              </h3>
              {surgicalCase.attachments.length > 0 && (
                <button
                  onClick={() => openViewerAt(0)}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Open in PACS / Cine Viewer
                </button>
              )}
            </div>

            {surgicalCase.attachments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                No radiographs, CT scans, or reports attached to this case.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {surgicalCase.attachments.map((att, idx) => {
                  const isVid = att.isVideo || att.category.includes('Video') || att.category.includes('Cine');
                  return (
                    <div
                      key={att.id}
                      onClick={() => openViewerAt(idx)}
                      className="group bg-slate-950 border border-slate-800 hover:border-teal-500/50 rounded-xl overflow-hidden cursor-pointer transition flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-black flex items-center justify-center overflow-hidden relative">
                        {isVid ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-teal-400">
                            <span className="text-2xl">🎥</span>
                            <span className="text-[10px] font-mono text-slate-400 mt-1">Cine Video</span>
                          </div>
                        ) : (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-200"
                          />
                        )}
                        <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <span className="px-2.5 py-1 rounded bg-slate-900/90 text-teal-300 text-xs font-medium border border-teal-500/30">
                            {isVid ? 'Play Video' : 'Click to View'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                          {isVid && <span className="text-[10px] px-1 bg-teal-500/20 text-teal-300 rounded font-mono">VIDEO</span>}
                          <span>{att.category}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{att.name}</div>
                        {att.notes && (
                          <p className="text-[11px] text-teal-400/90 line-clamp-1 mt-1">{att.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Case ID: {surgicalCase.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Radiology Fullscreen Viewer */}
      {viewerOpen && (
        <RadiologyViewerModal
          attachments={surgicalCase.attachments}
          initialIndex={viewerStartIndex}
          patientName={surgicalCase.patientName}
          procedureName={surgicalCase.procedureName}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};
