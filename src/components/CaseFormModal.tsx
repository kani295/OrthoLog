import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Calendar,
  AlertTriangle,
  Activity,
  FileText,
  Image as ImageIcon,
  Check,
  Stethoscope,
  Scissors,
  Eye,
  Film,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  SurgicalCase,
  ProcedureCategory,
  Laterality,
  Gender,
  AnesthesiaType,
  CaseAttachment,
  ComplicationTiming,
  ComplicationSeverity,
  InfectionType,
  AttachmentCategory,
} from '../types/ortho';
import {
  SAMPLE_XRAY_PREOP_KNEE,
  SAMPLE_XRAY_POSTOP_KNEE,
  SAMPLE_XRAY_HIP_POSTOP,
  SAMPLE_XRAY_TRAUMA_ANKLE,
} from '../services/storage';
import { isAttachmentVideo, createSampleCtVideoDataUrl } from '../utils/media';

interface Props {
  initialCase?: SurgicalCase | null;
  onSave: (caseData: SurgicalCase) => void;
  onClose: () => void;
}

const COMMON_PROCEDURES: { name: string; category: ProcedureCategory }[] = [
  { name: 'Primary Total Knee Arthroplasty (TKA)', category: 'Arthroplasty' },
  { name: 'Total Hip Arthroplasty (THA)', category: 'Arthroplasty' },
  { name: 'Unicompartmental Knee Arthroplasty (UKA)', category: 'Arthroplasty' },
  { name: 'Revision Total Knee Arthroplasty', category: 'Arthroplasty' },
  { name: 'Revision Total Hip Arthroplasty', category: 'Arthroplasty' },
  { name: 'Arthroscopic ACL Reconstruction', category: 'Sports & Arthroscopy' },
  { name: 'Arthroscopic Meniscectomy / Meniscal Repair', category: 'Sports & Arthroscopy' },
  { name: 'Arthroscopic Rotator Cuff Repair', category: 'Sports & Arthroscopy' },
  { name: 'Arthroscopic Shoulder Stabilization (Bankart)', category: 'Sports & Arthroscopy' },
  { name: 'ORIF Distal Radius Fracture', category: 'Trauma & Fractures' },
  { name: 'ORIF Bimalleolar / Trimalleolar Ankle', category: 'Foot & Ankle' },
  { name: 'Cephalomedullary Nailing (Intertrochanteric Femur)', category: 'Trauma & Fractures' },
  { name: 'Intramedullary Nailing Femoral Shaft', category: 'Trauma & Fractures' },
  { name: 'Intramedullary Nailing Tibial Shaft', category: 'Trauma & Fractures' },
  { name: 'L4-L5 Transforaminal Lumbar Interbody Fusion (TLIF)', category: 'Spine' },
  { name: 'Lumbar Microdiscectomy / Laminectomy', category: 'Spine' },
  { name: 'Carpal Tunnel Release', category: 'Hand & Upper Limb' },
  { name: 'Hallux Valgus Scarf / Akin Osteotomy', category: 'Foot & Ankle' },
];

export const CaseFormModal: React.FC<Props> = ({ initialCase, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'operative' | 'safety' | 'imaging'>('details');

  // Inline validation feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields - clean blank slate for case-by-case data entry
  const [patientName, setPatientName] = useState(initialCase?.patientName || '');
  const [hospitalId, setHospitalId] = useState(initialCase?.hospitalId || initialCase?.mrn || '');
  const [age, setAge] = useState<number | ''>(initialCase?.age !== undefined ? initialCase.age : '');
  const [gender, setGender] = useState<Gender | ''>(initialCase?.gender || '');
  const [surgeryDate, setSurgeryDate] = useState(
    initialCase?.surgeryDate || new Date().toISOString().split('T')[0]
  );
  const [procedureCategory, setProcedureCategory] = useState<ProcedureCategory | ''>(
    initialCase?.procedureCategory || ''
  );
  const [procedureName, setProcedureName] = useState(initialCase?.procedureName || '');
  const [laterality, setLaterality] = useState<Laterality | ''>(initialCase?.laterality || '');
  const [diagnosis, setDiagnosis] = useState(initialCase?.diagnosis || '');
  const [surgicalApproach, setSurgicalApproach] = useState(initialCase?.surgicalApproach || '');
  const [implants, setImplants] = useState(initialCase?.implants || '');
  const [anesthesia, setAnesthesia] = useState<AnesthesiaType | ''>(initialCase?.anesthesia || '');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(
    initialCase?.durationMinutes !== undefined ? initialCase.durationMinutes : ''
  );
  const [estimatedBloodLossMl, setEstimatedBloodLossMl] = useState<number | ''>(
    initialCase?.estimatedBloodLossMl !== undefined ? initialCase.estimatedBloodLossMl : ''
  );
  const [tourniquetMinutes, setTourniquetMinutes] = useState<number | ''>(
    initialCase?.tourniquetMinutes !== undefined ? initialCase.tourniquetMinutes : ''
  );
  const [postOpNotes, setPostOpNotes] = useState(initialCase?.postOpNotes || '');
  const [specialNotes, setSpecialNotes] = useState(initialCase?.specialNotes || '');

  // Complications
  const [hasComplication, setHasComplication] = useState(initialCase?.hasComplication || false);
  const [compType, setCompType] = useState(initialCase?.complicationDetails?.type || '');
  const [compTiming, setCompTiming] = useState<ComplicationTiming>(
    initialCase?.complicationDetails?.timing || 'Intraoperative'
  );
  const [compSeverity, setCompSeverity] = useState<ComplicationSeverity>(
    initialCase?.complicationDetails?.severity || 'Minor (Grade I-II)'
  );
  const [compDesc, setCompDesc] = useState(initialCase?.complicationDetails?.description || '');
  const [compMgmt, setCompMgmt] = useState(initialCase?.complicationDetails?.management || '');

  // Infections
  const [hasInfection, setHasInfection] = useState(initialCase?.hasInfection || false);
  const [infType, setInfType] = useState<InfectionType>(
    initialCase?.infectionDetails?.type || 'Superficial Incisional SSI'
  );
  const [infOrganism, setInfOrganism] = useState(
    initialCase?.infectionDetails?.organism || ''
  );
  const [infOnsetDays, setInfOnsetDays] = useState<number | ''>(
    initialCase?.infectionDetails?.onsetDaysPostOp !== undefined
      ? initialCase.infectionDetails.onsetDaysPostOp
      : ''
  );
  const [infTreatment, setInfTreatment] = useState(initialCase?.infectionDetails?.treatment || '');

  // Attachments
  const [attachments, setAttachments] = useState<CaseAttachment[]>(initialCase?.attachments || []);
  const [newAttCategory, setNewAttCategory] = useState<AttachmentCategory>('Pre-op X-ray');
  const [newAttNotes, setNewAttNotes] = useState('');
  const [isGeneratingSampleVideo, setIsGeneratingSampleVideo] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideoFile = file.type.startsWith('video/') ||
        ['.mp4', '.webm', '.mov', '.avi'].some((ext) => file.name.toLowerCase().endsWith(ext));

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        let chosenCategory = newAttCategory;
        if (isVideoFile && chosenCategory !== 'CT Video / 3D Cine Recon' && chosenCategory !== 'Fluoroscopy / C-arm Cine' && chosenCategory !== 'Arthroscopy Video Clip') {
          chosenCategory = 'CT Video / 3D Cine Recon';
        }

        const newAttachment: CaseAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          category: chosenCategory,
          dateAdded: new Date().toISOString().split('T')[0],
          dataUrl,
          notes: newAttNotes || undefined,
          isVideo: isVideoFile,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleAddSampleCtVideo = async () => {
    setIsGeneratingSampleVideo(true);
    try {
      const videoDataUrl = await createSampleCtVideoDataUrl();
      const newAtt: CaseAttachment = {
        id: `att-ctvid-${Date.now()}`,
        name: 'Pre-op 3D CT Pelvis Cine Recon.webm',
        category: 'CT Video / 3D Cine Recon',
        dateAdded: surgeryDate,
        dataUrl: videoDataUrl || SAMPLE_XRAY_PREOP_KNEE,
        notes: 'Axial slice cine loop through acetabulum and femoral heads demonstrating joint collapse and subchondral bone loss.',
        isVideo: true,
      };
      setAttachments((prev) => [...prev, newAtt]);
    } catch (err) {
      console.warn('Could not generate sample CT video:', err);
    } finally {
      setIsGeneratingSampleVideo(false);
    }
  };

  const handleAddSampleXray = (type: 'pre_knee' | 'post_knee' | 'hip' | 'ankle') => {
    let name = 'Radiograph.png';
    let category: AttachmentCategory = 'Pre-op X-ray';
    let dataUrl = SAMPLE_XRAY_PREOP_KNEE;
    let notes = 'Radiographic view';

    if (type === 'pre_knee') {
      name = 'Pre-op Standing Knee AP.png';
      category = 'Pre-op X-ray';
      dataUrl = SAMPLE_XRAY_PREOP_KNEE;
      notes = 'Medial compartment joint space loss (Grade 4).';
    } else if (type === 'post_knee') {
      name = 'Post-op Knee AP Radiograph.png';
      category = 'Post-op X-ray';
      dataUrl = SAMPLE_XRAY_POSTOP_KNEE;
      notes = 'Neutral mechanical axis restored with well-seated PS TKA components.';
    } else if (type === 'hip') {
      name = 'Post-op Pelvis & Right Hip AP.png';
      category = 'Post-op X-ray';
      dataUrl = SAMPLE_XRAY_HIP_POSTOP;
      notes = 'Press-fit cementless cup and stem with prophylactic cerclage cable.';
    } else if (type === 'ankle') {
      name = 'Post-op Ankle Mortise View.png';
      category = 'Post-op X-ray';
      dataUrl = SAMPLE_XRAY_TRAUMA_ANKLE;
      notes = 'ORIF plate and screws with anatomic mortise reduction.';
    }

    const newAtt: CaseAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category,
      dateAdded: surgeryDate,
      dataUrl,
      notes,
      isVideo: false,
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      setActiveTab('details');
      setErrorMessage('Please enter the patient name.');
      return;
    }
    if (!procedureName.trim()) {
      setActiveTab('details');
      setErrorMessage('Please enter or select the procedure name.');
      return;
    }

    setErrorMessage(null);

    const updatedCase: SurgicalCase = {
      id: initialCase?.id || `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      patientName: patientName.trim(),
      hospitalId: hospitalId.trim() || 'N/A',
      mrn: hospitalId.trim() || undefined,
      age: age !== '' ? Number(age) : 0,
      gender: (gender as Gender) || 'Other',
      surgeryDate: surgeryDate || new Date().toISOString().split('T')[0],
      procedureCategory: (procedureCategory as ProcedureCategory) || 'General Orthopedics',
      procedureName: procedureName.trim(),
      laterality: (laterality as Laterality) || 'N/A',
      diagnosis: diagnosis.trim() || 'Orthopedic Condition',
      surgicalApproach: surgicalApproach.trim() || undefined,
      implants: implants.trim() || undefined,
      anesthesia: (anesthesia as AnesthesiaType) || 'General',
      durationMinutes: durationMinutes !== '' ? Number(durationMinutes) : undefined,
      estimatedBloodLossMl: estimatedBloodLossMl !== '' ? Number(estimatedBloodLossMl) : undefined,
      tourniquetMinutes: tourniquetMinutes !== '' ? Number(tourniquetMinutes) : undefined,
      postOpNotes: postOpNotes.trim() || 'Uneventful immediate recovery.',
      specialNotes: specialNotes.trim() || undefined,
      hasComplication,
      complicationDetails: hasComplication
        ? {
            type: compType.trim() || 'Unspecified Complication',
            timing: compTiming,
            severity: compSeverity,
            description: compDesc.trim(),
            management: compMgmt.trim(),
          }
        : undefined,
      hasInfection,
      infectionDetails: hasInfection
        ? {
            type: infType,
            organism: infOrganism.trim() || 'Unspecified Organism',
            onsetDaysPostOp: infOnsetDays !== '' ? Number(infOnsetDays) : undefined,
            treatment: infTreatment.trim(),
          }
        : undefined,
      attachments,
      createdAt: initialCase?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedCase);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialCase ? 'Edit Surgical Log Entry' : 'Log New Orthopedic Surgery'}
              </h2>
              <p className="text-xs text-slate-400">
                Enter clinical details, operative findings, complications, CT videos, and radiographs
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

        {/* Tab Navigation - Responsive grid ensuring NO horizontal scrolling on any screen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-950/85 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'details'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. Patient & Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('operative')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'operative'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Operative & Implants</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`py-2 px-2.5 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'safety'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Complications</span>
            {(hasComplication || hasInfection) && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('imaging')}
            className={`py-2 px-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer text-center ${
              activeTab === 'imaging'
                ? 'bg-teal-600 text-white shadow-sm ring-1 ring-teal-400'
                : 'bg-slate-900/80 text-teal-400 hover:text-teal-200 hover:bg-slate-800 border border-teal-500/30'
            }`}
          >
            <Film className="w-3.5 h-3.5 shrink-0 text-teal-300" />
            <span className="truncate">4. X-Rays & CTs</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ml-0.5 ${
              attachments.length > 0 ? 'bg-teal-300 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
            }`}>
              {attachments.length}
            </span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PATIENT & PROCEDURE */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Patient Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Johnathan Smith"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Hospital ID
                  </label>
                  <input
                    type="text"
                    value={hospitalId}
                    onChange={(e) => setHospitalId(e.target.value)}
                    placeholder="e.g. HOSP-123456"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 58"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="" disabled>Select Gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date of Surgery <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={surgeryDate}
                    onChange={(e) => setSurgeryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Subspecialty and Laterality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subspecialty Category
                  </label>
                  <select
                    value={procedureCategory}
                    onChange={(e) => setProcedureCategory(e.target.value as ProcedureCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="" disabled>Select Subspecialty...</option>
                    <option value="Arthroplasty">Arthroplasty (Joint Replacement)</option>
                    <option value="Sports & Arthroscopy">Sports & Arthroscopy</option>
                    <option value="Trauma & Fractures">Trauma & Fractures</option>
                    <option value="Spine">Spine Surgery</option>
                    <option value="Foot & Ankle">Foot & Ankle</option>
                    <option value="Hand & Upper Limb">Hand & Upper Limb</option>
                    <option value="Pediatric Orthopedics">Pediatric Orthopedics</option>
                    <option value="Oncology & Reconstruction">Oncology & Reconstruction</option>
                    <option value="General Orthopedics">General Orthopedics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Laterality</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Left', 'Right', 'Bilateral', 'Axial / N/A'] as Laterality[]).map((lat) => (
                      <button
                        key={lat}
                        type="button"
                        onClick={() => setLaterality(lat)}
                        className={`py-2 px-1 text-xs rounded-lg border font-medium transition text-center ${
                          laterality === lat
                            ? 'bg-teal-600 text-white border-teal-500'
                            : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {lat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Procedure Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Procedure Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="Enter or select surgical procedure, e.g. Primary TKA, ORIF Ankle..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-medium"
                />

                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-500">Quick select:</span>
                  {COMMON_PROCEDURES.slice(0, 6).map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setProcedureName(item.name);
                        setProcedureCategory(item.category);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:border-teal-500 hover:text-white transition"
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pre-Operative Diagnosis & Indication
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. End-stage tricompartmental osteoarthritis / Fractured bone..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Surgical Approach & Anesthesia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Surgical Approach / Incision
                  </label>
                  <input
                    type="text"
                    value={surgicalApproach}
                    onChange={(e) => setSurgicalApproach(e.target.value)}
                    placeholder="e.g. Medial parapatellar / Direct anterior / Posterolateral"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Anesthesia Type
                  </label>
                  <select
                    value={anesthesia}
                    onChange={(e) => setAnesthesia(e.target.value as AnesthesiaType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="" disabled>Select Anesthesia Type...</option>
                    <option value="Spinal">Spinal Anesthesia</option>
                    <option value="General">General Anesthesia</option>
                    <option value="Epidural">Epidural</option>
                    <option value="Regional Nerve Block">Regional Nerve Block</option>
                    <option value="Combined">Combined Spinal-Epidural / Block</option>
                    <option value="Local">Local Infiltration</option>
                  </select>
                </div>
              </div>

              {/* Step Navigation for Tab 1 */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('imaging')}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition cursor-pointer"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Jump to 4. X-Rays & CTs ({attachments.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('operative')}
                  className="text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 hover:text-white px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Next: 2. Operative & Implants</span>
                  <ChevronRight className="w-4 h-4 text-teal-400" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIVE DETAILS & IMPLANTS */}
          {activeTab === 'operative' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Implants / Prosthesis / Hardware Specifications
                </label>
                <textarea
                  rows={2}
                  value={implants}
                  onChange={(e) => setImplants(e.target.value)}
                  placeholder="e.g. Stryker Triathlon PS Femur Size 5, Tibia Size 4, 10mm Poly Insert, Cemented"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 75"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated Blood Loss (mL)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={estimatedBloodLossMl}
                    onChange={(e) => setEstimatedBloodLossMl(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 100"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tourniquet Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tourniquetMinutes}
                    onChange={(e) => setTourniquetMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 45"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Postoperative Notes & Regimen <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={postOpNotes}
                  onChange={(e) => setPostOpNotes(e.target.value)}
                  placeholder="Immediate surgical findings, ligamentous balance, ROM achieved, weight-bearing status, DVT prophylaxis..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Special Notes / Clinical Pearls / Unique Anatomy
                </label>
                <textarea
                  rows={2}
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Previous hardware removal required, severe patellar tilt corrected..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Step Navigation for Tab 2 */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to 1. Patient</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('imaging')}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Jump to 4. X-Rays ({attachments.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('safety')}
                    className="text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 hover:text-white px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Next: 3. Complications</span>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLICATIONS & INFECTIONS */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-sm text-white">Surgical Complication</span>
                  </div>
                  <label className="flex items-center cursor-pointer gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {hasComplication ? 'Complication Recorded' : 'No Complication'}
                    </span>
                    <input
                      type="checkbox"
                      checked={hasComplication}
                      onChange={(e) => setHasComplication(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 relative"></div>
                  </label>
                </div>

                {hasComplication && (
                  <div className="pt-3 border-t border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Complication Type</label>
                        <select
                          value={compType}
                          onChange={(e) => setCompType(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="" disabled>Select Complication Type...</option>
                          <option value="Intraoperative Fracture / Calcar Crack">Intraoperative Fracture / Calcar Crack</option>
                          <option value="DVT (Deep Vein Thrombosis)">DVT (Deep Vein Thrombosis)</option>
                          <option value="Pulmonary Embolism (PE)">Pulmonary Embolism (PE)</option>
                          <option value="Nerve Injury / Neuropraxia">Nerve Injury / Neuropraxia</option>
                          <option value="Vascular Injury / Bleeding">Vascular Injury / Bleeding</option>
                          <option value="Dural Tear / CSF Leak">Dural Tear / CSF Leak</option>
                          <option value="Implant Dislocation / Subluxation">Implant Dislocation / Subluxation</option>
                          <option value="Periprosthetic Fracture">Periprosthetic Fracture</option>
                          <option value="Hardware Failure / Screw Cutout">Hardware Failure / Screw Cutout</option>
                          <option value="Other Surgical Complication">Other Complication</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Timing</label>
                        <select
                          value={compTiming}
                          onChange={(e) => setCompTiming(e.target.value as ComplicationTiming)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Intraoperative">Intraoperative</option>
                          <option value="Early Post-op (<30 days)">Early Post-op (&lt;30 days)</option>
                          <option value="Late Post-op (>30 days)">Late Post-op (&gt;30 days)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Severity</label>
                        <select
                          value={compSeverity}
                          onChange={(e) => setCompSeverity(e.target.value as ComplicationSeverity)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Minor (Grade I-II)">Minor (Grade I-II)</option>
                          <option value="Major (Grade III-IV)">Major (Grade III-IV)</option>
                          <option value="Revision / Catastrophic">Revision / Catastrophic</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Description of Complication</label>
                      <input
                        type="text"
                        value={compDesc}
                        onChange={(e) => setCompDesc(e.target.value)}
                        placeholder="e.g. Nondisplaced calcar crack while broaching..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Management & Corrective Action</label>
                      <input
                        type="text"
                        value={compMgmt}
                        onChange={(e) => setCompMgmt(e.target.value)}
                        placeholder="e.g. Prophylactic cerclage cable placed..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Infections Section */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-rose-400" />
                    <span className="font-semibold text-sm text-white">Surgical Site Infection (SSI)</span>
                  </div>
                  <label className="flex items-center cursor-pointer gap-2">
                    <span className="text-xs text-slate-400 font-medium">
                      {hasInfection ? 'Infection Recorded' : 'No Infection'}
                    </span>
                    <input
                      type="checkbox"
                      checked={hasInfection}
                      onChange={(e) => setHasInfection(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600 relative"></div>
                  </label>
                </div>

                {hasInfection && (
                  <div className="pt-3 border-t border-slate-800 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Infection Classification</label>
                        <select
                          value={infType}
                          onChange={(e) => setInfType(e.target.value as InfectionType)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        >
                          <option value="Superficial Incisional SSI">Superficial Incisional SSI</option>
                          <option value="Deep Incisional SSI">Deep Incisional SSI</option>
                          <option value="Organ / Space / Prosthetic Joint Infection (PJI)">Organ / Space / PJI</option>
                          <option value="Septic Arthritis">Septic Arthritis</option>
                          <option value="Pin-Tract Infection">Pin-Tract Infection</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Microbiology / Organism</label>
                        <input
                          type="text"
                          value={infOrganism}
                          onChange={(e) => setInfOrganism(e.target.value)}
                          placeholder="e.g. S. aureus (MSSA) / MRSE"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Post-op Onset (Days)</label>
                        <input
                          type="number"
                          min="0"
                          value={infOnsetDays}
                          onChange={(e) => setInfOnsetDays(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="e.g. 7"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Antimicrobial & Surgical Treatment</label>
                      <input
                        type="text"
                        value={infTreatment}
                        onChange={(e) => setInfTreatment(e.target.value)}
                        placeholder="e.g. Oral Cephalexin / DAIR + IV Vancomycin"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Step Navigation for Tab 3 */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('operative')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to 2. Operative</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('imaging')}
                  className="text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 px-4 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-500/20"
                >
                  <Film className="w-4 h-4 text-slate-950" />
                  <span>Next: 4. X-Rays, CT Scans & Reports ({attachments.length})</span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: IMAGING & VIDEOS */}
          {activeTab === 'imaging' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-teal-400" />
                      Attach Pre/Post-Op X-rays, CT Videos & Reports
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Accepts images (PNG, JPG), video clips (MP4, WebM, MOV for CT cine loops), and PDF documents
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Image or Video
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Attachment Category</label>
                    <select
                      value={newAttCategory}
                      onChange={(e) => setNewAttCategory(e.target.value as AttachmentCategory)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    >
                      <option value="Pre-op X-ray">Pre-op X-ray</option>
                      <option value="Post-op X-ray">Post-op X-ray</option>
                      <option value="Pre-op CT">Pre-op CT Scan</option>
                      <option value="Post-op CT">Post-op CT Scan</option>
                      <option value="CT Video / 3D Cine Recon">🎥 CT Video / 3D Cine Recon</option>
                      <option value="Fluoroscopy / C-arm Cine">🎥 Fluoroscopy / C-arm Cine Loop</option>
                      <option value="Arthroscopy Video Clip">🎥 Arthroscopy Surgical Video</option>
                      <option value="MRI">MRI Scan</option>
                      <option value="Intra-op Photo">Intra-op Clinical Photo</option>
                      <option value="Clinical / Lab Report">Clinical / Lab / Pathology Report</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Findings / Video Caption</label>
                    <input
                      type="text"
                      value={newAttNotes}
                      onChange={(e) => setNewAttNotes(e.target.value)}
                      placeholder="e.g. Axial CT video sweep showing acetabular bone loss / Pre-op joint space"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Quick Presets including CT Cine Video */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">Quickly add sample imaging:</span>
                  <button
                    type="button"
                    onClick={handleAddSampleCtVideo}
                    disabled={isGeneratingSampleVideo}
                    className="px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-semibold transition flex items-center gap-1"
                  >
                    <Film className="w-3 h-3 text-teal-400" />
                    {isGeneratingSampleVideo ? 'Generating CT Video...' : '+ 3D CT Cine Video Loop'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSampleXray('pre_knee')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] transition"
                  >
                    + Pre-op Knee X-Ray
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSampleXray('post_knee')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] transition"
                  >
                    + Post-op TKA X-Ray
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSampleXray('hip')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-[11px] transition"
                  >
                    + Post-op THA X-Ray
                  </button>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Attached Series & Media ({attachments.length})
                </h4>

                {attachments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
                    No radiographs, CT videos, or reports attached yet. Use the upload button above or pick a sample.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att) => {
                      const isVid = isAttachmentVideo(att);
                      return (
                        <div
                          key={att.id}
                          className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3 relative group"
                        >
                          <div className="w-16 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center relative">
                            {isVid ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-teal-400">
                                <Film className="w-6 h-6" />
                                <span className="text-[9px] font-mono text-slate-400">Video</span>
                              </div>
                            ) : (
                              <img
                                src={att.dataUrl}
                                alt={att.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            )}
                            {isVid && (
                              <div className="absolute top-1 right-1 bg-teal-600 text-white rounded p-0.5">
                                <Play className="w-2.5 h-2.5 fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-teal-300 truncate flex items-center gap-1">
                                {isVid && <Film className="w-3 h-3" />}
                                {att.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(att.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                                title="Remove attachment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-xs text-white truncate mt-0.5">{att.name}</div>
                            {att.notes && (
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                                {att.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step Navigation for Tab 4 */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to 3. Complications</span>
                </button>

                <div className="text-xs text-teal-400 flex items-center gap-1">
                  <Check className="w-4 h-4 text-teal-400" />
                  <span>All sections completed ({attachments.length} attachment{attachments.length !== 1 ? 's' : ''})</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              * Required fields: Patient Name, Date, Procedure, Post-Op Notes
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {initialCase ? 'Update Surgery Record' : 'Save Surgery Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
