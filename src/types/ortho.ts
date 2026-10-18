export type ProcedureCategory =
  | 'Arthroplasty'
  | 'Sports & Arthroscopy'
  | 'Trauma & Fractures'
  | 'Spine'
  | 'Foot & Ankle'
  | 'Hand & Upper Limb'
  | 'Pediatric Orthopedics'
  | 'Oncology & Reconstruction'
  | 'General Orthopedics';

export type Laterality = 'Left' | 'Right' | 'Bilateral' | 'Axial / N/A';

export type Gender = 'Male' | 'Female' | 'Other';

export type AnesthesiaType = 'Spinal' | 'General' | 'Epidural' | 'Regional Nerve Block' | 'Combined' | 'Local';

export type ComplicationSeverity = 'Minor (Grade I-II)' | 'Major (Grade III-IV)' | 'Revision / Catastrophic';

export type ComplicationTiming = 'Intraoperative' | 'Early Post-op (<30 days)' | 'Late Post-op (>30 days)';

export type InfectionType =
  | 'Superficial Incisional SSI'
  | 'Deep Incisional SSI'
  | 'Organ / Space / Prosthetic Joint Infection (PJI)'
  | 'Septic Arthritis'
  | 'Pin-Tract Infection';

export type AttachmentCategory =
  | 'Pre-op X-ray'
  | 'Post-op X-ray'
  | 'Pre-op CT'
  | 'Post-op CT'
  | 'CT Video / 3D Cine Recon'
  | 'Fluoroscopy / C-arm Cine'
  | 'Arthroscopy Video Clip'
  | 'MRI'
  | 'Intra-op Photo'
  | 'Clinical / Lab Report';

export interface CaseAttachment {
  id: string;
  name: string;
  category: AttachmentCategory;
  dateAdded: string;
  dataUrl: string; // Base64 data URL, blob URL, or SVG
  notes?: string;
  isVideo?: boolean;
  isDicomOrRaw?: boolean;
}

export interface ComplicationRecord {
  type: string;
  timing: ComplicationTiming;
  severity: ComplicationSeverity;
  description: string;
  management: string;
}

export interface InfectionRecord {
  type: InfectionType;
  organism?: string;
  onsetDaysPostOp?: number;
  treatment: string;
}

export interface SurgicalCase {
  id: string;
  patientName: string;
  hospitalId: string; // Hospital ID
  mrn?: string; // Legacy fallback
  age: number;
  gender: Gender;
  surgeryDate: string; // YYYY-MM-DD
  procedureCategory: ProcedureCategory;
  procedureName: string;
  laterality: Laterality;
  diagnosis: string;
  surgicalApproach?: string;
  implants?: string;
  anesthesia: AnesthesiaType;
  durationMinutes?: number;
  estimatedBloodLossMl?: number;
  tourniquetMinutes?: number;
  postOpNotes: string;
  specialNotes?: string;
  hasComplication: boolean;
  complicationDetails?: ComplicationRecord;
  hasInfection: boolean;
  infectionDetails?: InfectionRecord;
  attachments: CaseAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface LogbookFilterState {
  searchQuery: string;
  dateRangePreset: 'all' | 'this_month' | 'last_3_months' | 'this_year' | 'last_year' | 'custom';
  startDate?: string;
  endDate?: string;
  category: string; // 'all' or specific ProcedureCategory
  procedureName: string; // 'all' or specific procedure
  laterality: string; // 'all' or Laterality
  gender: string; // 'all' or Gender
  onlyComplications: boolean;
  onlyInfections: boolean;
  sortBy: 'date_desc' | 'date_asc' | 'patient_name' | 'duration_desc';
}

export interface PeriodSummaryReport {
  startDate: string;
  endDate: string;
  procedureFilter: string;
  categoryFilter: string;
  totalSurgeries: number;
  genderCounts: Record<Gender, number>;
  averageAge: number;
  lateralityCounts: Record<Laterality, number>;
  procedureBreakdown: { name: string; count: number; percentage: number }[];
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  complicationsCount: number;
  complicationRate: number; // percentage
  infectionsCount: number;
  infectionRate: number; // percentage
  complicationCases: SurgicalCase[];
  infectionCases: SurgicalCase[];
  generatedAt: string;
}
