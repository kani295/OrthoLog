import { SurgicalCase } from '../types/ortho';

const LOCAL_STORAGE_KEY = 'ortholog_surgical_cases_v1';
const DB_NAME = 'OrthoLogDB';
const DB_VERSION = 1;
const STORE_NAME = 'surgical_cases';

// Realistic sample X-ray SVG data URLs to provide immediate visual fidelity
export const SAMPLE_XRAY_PREOP_KNEE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" style="background:%2305070a">
  <defs>
    <radialGradient id="softTissue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%231e293b" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="%2305070a" stop-opacity="0.2"/>
    </radialGradient>
    <filter id="boneGaze">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Soft tissue contour -->
  <path d="M 160 50 Q 140 350 170 650 L 430 650 Q 460 350 440 50 Z" fill="url(%23softTissue)"/>
  <!-- Distal Femur -->
  <path d="M 230 50 L 230 260 Q 220 330 180 340 Q 230 365 290 350 Q 350 365 400 340 Q 360 320 350 260 L 350 50 Z" fill="%23e2e8f0" filter="url(%23boneGaze)" opacity="0.9"/>
  <!-- Osteophyte spurring & Narrowing marker -->
  <path d="M 180 340 Q 170 348 185 352" stroke="%23cbd5e1" stroke-width="4" fill="none"/>
  <!-- Patella shadow -->
  <ellipse cx="290" cy="300" rx="42" ry="50" fill="%23cbd5e1" opacity="0.35"/>
  <!-- Joint Space: Severe Medial Joint Space Collapse (KL Grade 4) -->
  <line x1="180" y1="358" x2="280" y2="358" stroke="%23ef4444" stroke-width="2" stroke-dasharray="4 2"/>
  <text x="180" y="380" fill="%23ef4444" font-family="monospace" font-size="12" font-weight="bold">MEDIAL JOINT SPACE COLLAPSE (KL-4)</text>
  <!-- Proximal Tibia -->
  <path d="M 185 365 Q 230 375 290 365 Q 350 375 395 365 Q 360 410 340 450 L 340 650 L 240 650 L 240 450 Q 220 410 185 365 Z" fill="%23e2e8f0" filter="url(%23boneGaze)" opacity="0.9"/>
  <!-- Fibular Head -->
  <path d="M 395 380 Q 425 400 420 440 L 410 490 L 385 460 Z" fill="%23cbd5e1" opacity="0.8"/>
  <!-- HUD Annotation -->
  <text x="30" y="50" fill="%2338bdf8" font-family="monospace" font-size="14" font-weight="bold">PRE-OP AP RADIOGRAPH</text>
  <text x="30" y="72" fill="%2394a3b8" font-family="monospace" font-size="12">LEFT KNEE | WEIGHT-BEARING</text>
  <text x="30" y="92" fill="%2394a3b8" font-family="monospace" font-size="11">Subchondral sclerosis + Bone-on-bone</text>
  <text x="540" y="50" fill="%23fbbf24" font-family="sans-serif" font-size="24" font-weight="bold">L</text>
</svg>`;

export const SAMPLE_XRAY_POSTOP_KNEE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" style="background:%2305070a">
  <defs>
    <radialGradient id="softTissue2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%231e293b" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="%2305070a" stop-opacity="0.2"/>
    </radialGradient>
    <linearGradient id="cobaltChrome" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ffffff"/>
      <stop offset="40%" stop-color="%23f8fafc"/>
      <stop offset="100%" stop-color="%23cbd5e1"/>
    </linearGradient>
  </defs>
  <!-- Soft tissue -->
  <path d="M 160 50 Q 140 350 170 650 L 430 650 Q 460 350 440 50 Z" fill="url(%23softTissue2)"/>
  <!-- Distal Femur bone -->
  <path d="M 230 50 L 230 260 L 350 260 L 350 50 Z" fill="%2394a3b8" opacity="0.8"/>
  <!-- Femoral Component (Cobalt Chrome high radiodensity) -->
  <path d="M 210 270 L 220 345 Q 285 360 360 345 L 370 270 Q 320 280 290 275 Q 260 280 210 270 Z" fill="url(%23cobaltChrome)" stroke="%23ffffff" stroke-width="2"/>
  <rect x="270" y="240" width="40" height="35" fill="url(%23cobaltChrome)"/>
  <!-- Polyethylene Insert (Radiolucent gap with perfect 10mm restoration) -->
  <rect x="215" y="347" width="150" height="14" fill="%230284c7" opacity="0.3" stroke="%2338bdf8" stroke-dasharray="3 3"/>
  <text x="375" y="358" fill="%2338bdf8" font-family="monospace" font-size="11">10mm Poly Insert</text>
  <!-- Tibial Tray & Keel (Titanium) -->
  <path d="M 205 362 L 375 362 L 370 375 L 305 375 L 302 440 L 285 440 L 282 375 L 210 375 Z" fill="url(%23cobaltChrome)" stroke="%23ffffff" stroke-width="1.5"/>
  <!-- Proximal Tibia bone -->
  <path d="M 200 378 Q 230 410 240 450 L 240 650 L 340 650 L 340 450 Q 350 410 380 378 Z" fill="%2394a3b8" opacity="0.8"/>
  <!-- Fibula -->
  <path d="M 390 390 Q 420 410 415 450 L 405 490 L 380 460 Z" fill="%2364748b" opacity="0.7"/>
  <!-- Alignment Axis -->
  <line x1="290" y1="40" x2="290" y2="660" stroke="%2322c55e" stroke-width="1.5" stroke-dasharray="6 4"/>
  <!-- HUD Annotation -->
  <text x="30" y="50" fill="%2322c55e" font-family="monospace" font-size="14" font-weight="bold">POST-OP AP RADIOGRAPH</text>
  <text x="30" y="72" fill="%2394a3b8" font-family="monospace" font-size="12">LEFT KNEE | POSTERIOR STABILIZED TKA</text>
  <text x="30" y="92" fill="%2322c55e" font-family="monospace" font-size="11">Neutral mechanical axis restored (180°)</text>
  <text x="540" y="50" fill="%23fbbf24" font-family="sans-serif" font-size="24" font-weight="bold">L</text>
</svg>`;

export const SAMPLE_XRAY_HIP_POSTOP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" style="background:%2305070a">
  <defs>
    <radialGradient id="hipTissue" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="%231e293b" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="%2305070a" stop-opacity="0.2"/>
    </radialGradient>
  </defs>
  <path d="M 100 50 Q 200 40 500 50 L 500 650 Q 250 650 100 650 Z" fill="url(%23hipTissue)"/>
  <!-- Pelvic contour -->
  <path d="M 120 70 Q 280 80 400 120 Q 320 250 250 280 Q 150 220 120 70 Z" fill="%23cbd5e1" opacity="0.65"/>
  <!-- Acetabular Cup (45 deg abduction, 20 deg anteversion) -->
  <path d="M 230 190 A 42 42 0 0 1 290 250 L 245 270 Z" fill="%23ffffff" stroke="%2338bdf8" stroke-width="2"/>
  <circle cx="260" cy="225" r="18" fill="%23f1f5f9"/>
  <!-- Femoral Stem (Titanium tapered wedge) -->
  <path d="M 260 225 L 290 280 L 320 310 L 310 520 L 290 520 L 285 340 L 245 270 Z" fill="%23ffffff"/>
  <!-- Prophylactic Cerclage Cable at Calcar -->
  <ellipse cx="300" cy="320" rx="36" ry="12" fill="none" stroke="%23f59e0b" stroke-width="3"/>
  <text x="350" y="325" fill="%23f59e0b" font-family="monospace" font-size="11">Cerclage Cable (Calcar)</text>
  <!-- Proximal Femur Bone -->
  <path d="M 330 300 Q 360 330 350 420 L 340 650 L 270 650 L 265 420 Q 250 360 270 320 Z" fill="%2394a3b8" opacity="0.75"/>
  <!-- HUD Annotation -->
  <text x="30" y="50" fill="%2338bdf8" font-family="monospace" font-size="14" font-weight="bold">POST-OP AP PELVIS / RIGHT HIP</text>
  <text x="30" y="72" fill="%2394a3b8" font-family="monospace" font-size="12">TOTAL HIP ARTHROPLASTY</text>
  <text x="30" y="92" fill="%23f59e0b" font-family="monospace" font-size="11">Broach calcar crack stabilized with Dall-Miles cable</text>
  <text x="540" y="50" fill="%23fbbf24" font-family="sans-serif" font-size="24" font-weight="bold">R</text>
</svg>`;

export const SAMPLE_XRAY_TRAUMA_ANKLE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" style="background:%2305070a">
  <path d="M 180 50 L 190 480 Q 200 560 160 580 L 240 580 Q 280 550 280 480 L 270 50 Z" fill="%23cbd5e1" opacity="0.8"/>
  <!-- Fibula with 1/3 Tubular Plate and 6 Cortical Screws -->
  <path d="M 340 50 L 340 460 Q 350 540 370 580 L 320 580 Q 310 520 310 460 L 310 50 Z" fill="%2394a3b8" opacity="0.75"/>
  <!-- Metal Plate -->
  <rect x="330" y="320" width="14" height="240" rx="3" fill="%23ffffff" stroke="%2338bdf8" stroke-width="1.5"/>
  <!-- Screws -->
  <line x1="320" y1="350" x2="355" y2="350" stroke="%23ffffff" stroke-width="4"/>
  <line x1="320" y1="390" x2="355" y2="390" stroke="%23ffffff" stroke-width="4"/>
  <line x1="320" y1="430" x2="355" y2="430" stroke="%23ffffff" stroke-width="4"/>
  <line x1="315" y1="480" x2="360" y2="480" stroke="%23ffffff" stroke-width="4"/>
  <line x1="315" y1="520" x2="360" y2="520" stroke="%23ffffff" stroke-width="4"/>
  <!-- Medial Malleolus 4.0mm Cannulated Screws -->
  <line x1="160" y1="570" x2="220" y2="500" stroke="%23ffffff" stroke-width="4.5"/>
  <line x1="180" y1="585" x2="235" y2="520" stroke="%23ffffff" stroke-width="4.5"/>
  <!-- Talus -->
  <path d="M 180 595 Q 260 580 340 595 Q 360 650 320 670 L 200 670 Z" fill="%23cbd5e1" opacity="0.85"/>
  <text x="30" y="50" fill="%2322c55e" font-family="monospace" font-size="14" font-weight="bold">POST-OP MORTISE RADIOGRAPH</text>
  <text x="30" y="72" fill="%2394a3b8" font-family="monospace" font-size="12">RIGHT ANKLE | ORIF BIMALLEOLAR FRACTURE</text>
  <text x="30" y="92" fill="%2322c55e" font-family="monospace" font-size="11">Anatomic reduction of mortise and clear space (&lt;4mm)</text>
  <text x="540" y="50" fill="%23fbbf24" font-family="sans-serif" font-size="24" font-weight="bold">R</text>
</svg>`;

// Realistic orthopedic seed cases
export const INITIAL_SAMPLE_CASES: SurgicalCase[] = [
  {
    id: 'case-001',
    patientName: 'Robert M. Chen',
    hospitalId: 'HOSP-849201',
    age: 68,
    gender: 'Male',
    surgeryDate: '2026-09-12',
    procedureCategory: 'Arthroplasty',
    procedureName: 'Primary Total Knee Arthroplasty (TKA)',
    laterality: 'Left',
    diagnosis: 'Severe Primary Tricompartmental Osteoarthritis (Kellgren-Lawrence Grade IV) with 12° Varus Deformity',
    surgicalApproach: 'Medial Parapatellar',
    implants: 'Stryker Triathlon Posterior Stabilized (Femur Size 5, Tibia Size 4, 10mm X3 Polyethylene insert)',
    anesthesia: 'Spinal',
    durationMinutes: 72,
    estimatedBloodLossMl: 120,
    tourniquetMinutes: 48,
    postOpNotes: 'Uncomplicated procedure. Measured resection technique. Mechanical axis aligned to 180° neutral. Good medial/lateral collateral ligament balance throughout 0-120° ROM. Multimodal periarticular cocktail infiltrated. Full weight bearing on post-op day 0.',
    specialNotes: 'Pre-op flexion contracture 10° completely corrected to full extension after posterior capsular release. Patient mobilized with PT on ward 4 hours post-op.',
    hasComplication: false,
    hasInfection: false,
    attachments: [
      {
        id: 'att-101',
        name: 'Pre-op Bilateral Standing AP X-Ray.png',
        category: 'Pre-op X-ray',
        dateAdded: '2026-09-10',
        dataUrl: SAMPLE_XRAY_PREOP_KNEE,
        notes: 'Severe bone-on-bone medial joint space collapse with tibial subchondral sclerosis and medial osteophytes.',
      },
      {
        id: 'att-102',
        name: 'Post-op Day 1 Left Knee AP & Lateral X-Ray.png',
        category: 'Post-op X-ray',
        dateAdded: '2026-09-13',
        dataUrl: SAMPLE_XRAY_POSTOP_KNEE,
        notes: 'Components well positioned. Neutral mechanical axis. No cement extravasation.',
      },
    ],
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-13T09:30:00.000Z',
  },
  {
    id: 'case-002',
    patientName: 'Eleanor Vance',
    hospitalId: 'HOSP-739104',
    age: 74,
    gender: 'Female',
    surgeryDate: '2026-09-24',
    procedureCategory: 'Arthroplasty',
    procedureName: 'Total Hip Arthroplasty (THA)',
    laterality: 'Right',
    diagnosis: 'Avascular Necrosis of Femoral Head (Ficat Stage IV) with Secondary Osteoarthritis',
    surgicalApproach: 'Posterolateral (Moore)',
    implants: 'Depuy Pinnacle 52mm Acetabular Cup, 36mm Biolox Delta Ceramic Head, Corail AMT Size 12 Stem (Cementless)',
    anesthesia: 'Combined',
    durationMinutes: 95,
    estimatedBloodLossMl: 280,
    tourniquetMinutes: undefined,
    postOpNotes: 'Intraoperative calcar hairline crack occurred during final broaching of osteoporotic proximal femur. Identified immediately before stem insertion.',
    specialNotes: 'Prophylactic Dall-Miles cerclage cable placed around femoral neck/calcar prior to final stem seating. Stem seated with rock-solid axial and rotational stability. Leg lengths equalized.',
    hasComplication: true,
    complicationDetails: {
      type: 'Intraoperative Periprosthetic / Calcar Crack',
      timing: 'Intraoperative',
      severity: 'Minor (Grade I-II)',
      description: 'Nondisplaced vertical crack in medial calcar cortex during size 12 broach compaction.',
      management: 'Immediate placement of 2.0mm cobalt-chrome Dall-Miles cerclage cable. Stem seated securely; protected touch-down weight bearing for 6 weeks with walker.',
    },
    hasInfection: false,
    attachments: [
      {
        id: 'att-201',
        name: 'Post-op Pelvis & Right Hip AP X-Ray.png',
        category: 'Post-op X-ray',
        dateAdded: '2026-09-25',
        dataUrl: SAMPLE_XRAY_HIP_POSTOP,
        notes: 'Well-seated press-fit cup at 42° inclination. Calcar cerclage wire secure with no stem subsidence.',
      },
    ],
    createdAt: '2026-09-24T14:30:00.000Z',
    updatedAt: '2026-09-25T11:00:00.000Z',
  },
  {
    id: 'case-003',
    patientName: 'Marcus Davies',
    hospitalId: 'HOSP-918230',
    age: 24,
    gender: 'Male',
    surgeryDate: '2026-10-02',
    procedureCategory: 'Sports & Arthroscopy',
    procedureName: 'Arthroscopic ACL Reconstruction + Lateral Meniscus Repair',
    laterality: 'Right',
    diagnosis: 'Acute Complete ACL Rupture + Lateral Meniscus Bucket-Handle Tear (Soccer pivot injury)',
    surgicalApproach: 'Arthroscopic Anteromedial Portal & Quad Tendon Harvest',
    implants: 'Arthrex FiberRing Quadriceps Tendon Autograft, TightRope RT Femoral button, FastThread ABS Tibial screw',
    anesthesia: 'General',
    durationMinutes: 80,
    estimatedBloodLossMl: 40,
    tourniquetMinutes: 62,
    postOpNotes: 'Diagnostic arthroscopy revealed midsubstance ACL rupture and flipped bucket-handle tear of lateral meniscus body. Meniscus reduced and repaired with 3 inside-out 2-0 FiberWire sutures. Quad tendon autograft (9mm diameter) routed and secured with 90N tension at 20° flexion. Negative Lachman and pivot-shift on table.',
    specialNotes: 'Pre-op KT-1000 side-to-side difference 7mm. Post-op locked brace in extension for ambulation, range of motion 0-90° allowed for 4 weeks.',
    hasComplication: false,
    hasInfection: false,
    attachments: [
      {
        id: 'att-301',
        name: 'Pre-op Right Knee MRI Report & Coronal PD.png',
        category: 'MRI',
        dateAdded: '2026-09-28',
        dataUrl: SAMPLE_XRAY_PREOP_KNEE,
        notes: 'MRI confirmed complete ACL fiber discontinuity, bone bruise in lateral femoral condyle and posterior tibial plateau.',
      },
    ],
    createdAt: '2026-10-02T11:15:00.000Z',
    updatedAt: '2026-10-02T16:00:00.000Z',
  },
  {
    id: 'case-004',
    patientName: 'Patricia Miller',
    hospitalId: 'HOSP-620194',
    age: 63,
    gender: 'Female',
    surgeryDate: '2026-09-18',
    procedureCategory: 'Arthroplasty',
    procedureName: 'Two-Stage Revision TKA (Stage 1: Explantation + Articulating Spacer)',
    laterality: 'Right',
    diagnosis: 'Chronic Prosthetic Joint Infection (PJI) Right TKA (Late hematogenous onset)',
    surgicalApproach: 'Previous midline incision, Medial Parapatellar',
    implants: 'Handcrafted articulating polymethylmethacrylate (PMMA) antibiotic spacer (4g Vancomycin + 2g Tobramycin per 40g bone cement)',
    anesthesia: 'Spinal',
    durationMinutes: 130,
    estimatedBloodLossMl: 350,
    tourniquetMinutes: 90,
    postOpNotes: 'Extensive synovectomy and debridement of biofilm and purulence. Previous loose femoral and tibial components explanted without bone loss. Joint cavity pulse-lavaged with 9 Liters sterile saline with dilute betadine soak. Articulating cement spacer molded and inserted.',
    specialNotes: 'Intraoperative synovial fluid WBC count 84,000/mcL with 94% PMNs. Infectious Disease consult co-managing.',
    hasComplication: true,
    complicationDetails: {
      type: 'Prosthetic Joint Infection (PJI) requiring component removal',
      timing: 'Late Post-op (>30 days)',
      severity: 'Revision / Catastrophic',
      description: 'Presents 14 months after index surgery with erythema, acute joint effusion, and inability to bear weight.',
      management: 'Explantation of prosthesis, extensive debridement, antibiotic cement spacer placement, and 6 weeks IV Ceftriaxone & Vancomycin.',
    },
    hasInfection: true,
    infectionDetails: {
      type: 'Organ / Space / Prosthetic Joint Infection (PJI)',
      organism: 'Staphylococcus epidermidis (Methicillin-Resistant MRSE)',
      onsetDaysPostOp: 420,
      treatment: 'Explantation + high-dose antibiotic cement articulating spacer + 6 weeks IV Vancomycin (trough 15-20 mcg/mL) followed by oral Rifampin/Bactrim.',
    },
    attachments: [
      {
        id: 'att-401',
        name: 'Pre-op Knee Aspiration Lab & Culture Report.pdf',
        category: 'Clinical / Lab Report',
        dateAdded: '2026-09-15',
        dataUrl: SAMPLE_XRAY_PREOP_KNEE,
        notes: 'Synovial fluid CRP 48 mg/L, ESR 65 mm/hr, multiple cultures positive for MRSE.',
      },
    ],
    createdAt: '2026-09-18T08:30:00.000Z',
    updatedAt: '2026-09-20T14:15:00.000Z',
  },
  {
    id: 'case-005',
    patientName: 'James O’Connor',
    hospitalId: 'HOSP-551029',
    age: 48,
    gender: 'Male',
    surgeryDate: '2026-09-29',
    procedureCategory: 'Trauma & Fractures',
    procedureName: 'ORIF Distal Radius Fracture',
    laterality: 'Left',
    diagnosis: 'Closed Comminuted Intra-articular Distal Radius Fracture (AO/OTA 23-C2) with Dorsal Tilt',
    surgicalApproach: 'Modified Henry Volar Approach',
    implants: 'Synthes 2.4mm Variable Angle LCP Volar Extra-Articular/Intra-Articular Two-Column Distal Radius Plate',
    anesthesia: 'Regional Nerve Block',
    durationMinutes: 55,
    estimatedBloodLossMl: 30,
    tourniquetMinutes: 42,
    postOpNotes: 'Flexor carpi radialis sheath opened, pronator quadratus reflected L-shaped. Fracture fragments disimpacted and reduced under fluoroscopy. Volar plate affixed with cortical and locking screws. Restoration of radial inclination (23°), volar tilt (11°), and radial height (12mm).',
    specialNotes: 'Intraoperative fluoroscopy confirmed no screws penetrating into radiocarpal joint (skyline and tangential views). Median nerve normal post-block resolution.',
    hasComplication: false,
    hasInfection: false,
    attachments: [],
    createdAt: '2026-09-29T16:00:00.000Z',
    updatedAt: '2026-09-29T18:00:00.000Z',
  },
  {
    id: 'case-006',
    patientName: 'David Sterling',
    hospitalId: 'HOSP-881729',
    age: 53,
    gender: 'Male',
    surgeryDate: '2026-10-06',
    procedureCategory: 'Spine',
    procedureName: 'L4-L5 Minimally Invasive TLIF & Posterior Instrumentation',
    laterality: 'Axial / N/A',
    diagnosis: 'L4-L5 Grade I Degenerative Spondylolisthesis with Severe Foraminal Stenosis and Radiculopathy',
    surgicalApproach: 'Posterior Midline with Tubular Retractor',
    implants: 'Medtronic Solera 6.0mm Pedicle Screws (4), 10mm PEEK Capstone Interbody Cage with DBM and Autograft',
    anesthesia: 'General',
    durationMinutes: 145,
    estimatedBloodLossMl: 150,
    tourniquetMinutes: undefined,
    postOpNotes: 'Microscopic unilateral laminectomy and bilateral decompression. Complete release of L4 exiting and L5 traversing roots. Disc space cleaned thoroughly. Good lordotic cage placement and compression. Spondylolisthesis reduced to anatomic.',
    specialNotes: 'Neuromonitoring (MEP/SSEP and stimulated EMG) stable throughout case. Subfascial closed suction drain placed.',
    hasComplication: false,
    hasInfection: false,
    attachments: [],
    createdAt: '2026-10-06T12:00:00.000Z',
    updatedAt: '2026-10-07T08:30:00.000Z',
  },
  {
    id: 'case-007',
    patientName: 'Harold Gomez',
    hospitalId: 'HOSP-449102',
    age: 82,
    gender: 'Male',
    surgeryDate: '2026-09-08',
    procedureCategory: 'Trauma & Fractures',
    procedureName: 'Cephalomedullary Nailing (Intertrochanteric Femur Fracture)',
    laterality: 'Left',
    diagnosis: 'Unstable Intertrochanteric Femur Fracture (AO/OTA 31-A2) s/p Ground-Level Mechanical Fall',
    surgicalApproach: 'Percutaneous Trochanteric Entry',
    implants: 'Stryker Gamma3 Long Cephalomedullary Nail (180mm x 10mm, 125° angle, 95mm lag screw)',
    anesthesia: 'Spinal',
    durationMinutes: 50,
    estimatedBloodLossMl: 110,
    tourniquetMinutes: undefined,
    postOpNotes: 'Patient placed on fracture table, traction applied. Fracture reduced anatomical under C-arm. Guide wire placed in center-center position on AP and lateral. Tip-Apex Distance (TAD) = 14mm. Distal dynamic locking completed.',
    specialNotes: 'Patient developed superficial surgical site erythema and slight serous drainage at proximal incision on post-op day 9.',
    hasComplication: false,
    hasInfection: true,
    infectionDetails: {
      type: 'Superficial Incisional SSI',
      organism: 'Staphylococcus aureus (MSSA)',
      onsetDaysPostOp: 9,
      treatment: 'Oral Cephalexin 500mg QID for 10 days + wound dressing changes. Complete resolution without need for surgical debridement.',
    },
    attachments: [],
    createdAt: '2026-09-08T15:20:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'case-008',
    patientName: 'Liam Gallagher',
    hospitalId: 'HOSP-331902',
    age: 33,
    gender: 'Male',
    surgeryDate: '2026-10-10',
    procedureCategory: 'Foot & Ankle',
    procedureName: 'ORIF Bimalleolar Ankle Fracture + Syndesmotic Fixation',
    laterality: 'Right',
    diagnosis: 'Right Ankle Bimalleolar Fracture Dislocation (Lauge-Hansen SER IV) with Gross Instability',
    surgicalApproach: 'Dual Incision: Lateral Transfibular & Medial Malleolar',
    implants: 'Acumed 1/3 Tubular Plate (7 holes), two 4.0mm partially threaded cancellous medial malleolar screws, Arthrex Syndesmosis TightRope',
    anesthesia: 'Spinal',
    durationMinutes: 68,
    estimatedBloodLossMl: 45,
    tourniquetMinutes: 55,
    postOpNotes: 'Lateral fibular length and rotation restored with lag screw and neutralization plate. Medial malleolus reduced anatomically with two 4.0mm lag screws. Cotton test under fluoroscopy showed syndesmotic widening; TightRope placed 2cm above joint line. Joint line completely congruent.',
    specialNotes: 'Non-weight bearing in posterior splint for 2 weeks, then CAM boot with gentle early range of motion.',
    hasComplication: false,
    hasInfection: false,
    attachments: [
      {
        id: 'att-801',
        name: 'Post-op Ankle Mortise X-Ray.png',
        category: 'Post-op X-ray',
        dateAdded: '2026-10-10',
        dataUrl: SAMPLE_XRAY_TRAUMA_ANKLE,
        notes: 'Anatomical reduction of fibula and medial malleolus. Syndesmotic clear space < 4mm restored.',
      },
    ],
    createdAt: '2026-10-10T14:00:00.000Z',
    updatedAt: '2026-10-10T17:30:00.000Z',
  },
  {
    id: 'case-009',
    patientName: 'Margaret King',
    hospitalId: 'HOSP-672911',
    age: 66,
    gender: 'Female',
    surgeryDate: '2026-10-14',
    procedureCategory: 'Arthroplasty',
    procedureName: 'Primary Total Knee Arthroplasty (TKA)',
    laterality: 'Right',
    diagnosis: 'End-Stage Osteoarthritis with Fixed Flexion Contracture (KL Grade 4)',
    surgicalApproach: 'Medial Parapatellar with Computer Navigation',
    implants: 'Zimmer Biomet Persona CR, Cemented, 9mm Ultra-high molecular weight poly insert',
    anesthesia: 'Spinal',
    durationMinutes: 65,
    estimatedBloodLossMl: 90,
    tourniquetMinutes: 40,
    postOpNotes: 'Computer-assisted navigation verified femoral cut at 3° valgus and tibial cut at 0° varus with 3° posterior slope. Symmetric 18mm flexion and extension gaps. Patella tracking centrally without lateral retinacular release.',
    specialNotes: 'Pain protocol: adductor canal catheter + periarticular liposomal bupivacaine.',
    hasComplication: false,
    hasInfection: false,
    attachments: [],
    createdAt: '2026-10-14T09:00:00.000Z',
    updatedAt: '2026-10-14T11:45:00.000Z',
  },
];

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export const BLANK_SHEET_KEY = 'ortholog_blank_sheet_v2';

/**
 * Completely clears all cases from IndexedDB and LocalStorage
 */
export async function clearAllCasesFromStorage(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  localStorage.setItem(BLANK_SHEET_KEY, 'true');
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch (err) {
    console.warn('Could not clear IndexedDB:', err);
  }
}

/**
 * Loads surgical cases from IndexedDB or LocalStorage.
 * Defaults to an empty list (blank sheet) with all sample data wiped.
 */
export async function loadCasesFromStorage(): Promise<SurgicalCase[]> {
  // If the blank sheet migration hasn't run yet, wipe all previous sample cases
  if (localStorage.getItem(BLANK_SHEET_KEY) !== 'true') {
    await clearAllCasesFromStorage();
    return [];
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const rawCases = request.result as SurgicalCase[];
        if (rawCases && rawCases.length > 0) {
          // If all cases are old sample/demo cases, purge them so the user gets a blank sheet
          const demoNames = ['Margaret Thorne', 'Robert Henderson', 'David Chen', 'Elena Rostova', 'Arthur Pendelton'];
          const nonDemo = rawCases.filter(c => !demoNames.includes(c.patientName) && !c.id.startsWith('sample-') && !c.id.startsWith('case-demo-'));
          
          if (nonDemo.length === 0 && rawCases.every(c => demoNames.includes(c.patientName) || c.id.startsWith('sample-') || c.id.startsWith('case-'))) {
            // Wiping old sample cases
            clearAllCasesFromStorage();
            resolve([]);
            return;
          }

          const normalized = (nonDemo.length > 0 ? nonDemo : rawCases).map((c) => ({
            ...c,
            hospitalId: c.hospitalId || c.mrn || `HOSP-${c.id.slice(-6)}`,
          }));
          resolve(normalized);
        } else {
          // Check localStorage fallback
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const demoNames = ['Margaret Thorne', 'Robert Henderson', 'David Chen', 'Elena Rostova', 'Arthur Pendelton'];
                const nonDemo = parsed.filter((c: any) => !demoNames.includes(c.patientName) && !c.id?.startsWith('sample-') && !c.id?.startsWith('case-'));
                if (nonDemo.length === 0) {
                  clearAllCasesFromStorage();
                  resolve([]);
                  return;
                }
                const normalized = nonDemo.map((c: any) => ({
                  ...c,
                  hospitalId: c.hospitalId || c.mrn || `HOSP-${c.id?.slice(-6) || '001'}`,
                }));
                resolve(normalized);
                return;
              }
            } catch (e) {
              console.error('Error parsing localStorage:', e);
            }
          }
          // Default is a clean blank sheet
          resolve([]);
        }
      };
      request.onerror = () => {
        // Fallback to localStorage
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          try {
            resolve(JSON.parse(raw));
            return;
          } catch (e) {}
        }
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, using localStorage:', err);
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [];
  }
}

/**
 * Saves cases array to both IndexedDB and LocalStorage
 */
export async function saveCasesToStorage(cases: SurgicalCase[]): Promise<void> {
  try {
    // Save to localStorage without large dataUrls to prevent quota exceeded errors
    const sanitizedForLocalStorage = cases.map((c) => ({
      ...c,
      attachments: c.attachments.map((att) => ({
        ...att,
        // Keep small svgs/urls, but truncate if massive
        dataUrl: att.dataUrl.length > 500000 ? att.dataUrl.slice(0, 500000) : att.dataUrl,
      })),
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitizedForLocalStorage));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const c of cases) {
      store.put(c);
    }
  } catch (err) {
    console.error('IndexedDB save failed:', err);
  }
}

/**
 * Exports cases as a downloadable JSON file
 */
export function downloadJsonExport(cases: SurgicalCase[]): void {
  const data = JSON.stringify({ app: 'OrthoLog', exportedAt: new Date().toISOString(), cases }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OrthoLog_Cases_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Exports cases as a downloadable CSV spreadsheet
 */
export function downloadCsvExport(cases: SurgicalCase[]): void {
  const headers = [
    'Surgery Date',
    'Patient Name',
    'Hospital ID',
    'Age',
    'Gender',
    'Procedure',
    'Subspecialty',
    'Laterality',
    'Diagnosis',
    'Implants',
    'Anesthesia',
    'Duration (min)',
    'Blood Loss (ml)',
    'Tourniquet (min)',
    'Complication',
    'Complication Detail',
    'Infection',
    'Infection Detail',
    'Post-Op Notes',
    'Special Notes',
  ];

  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const s = String(val).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = cases.map((c) => [
    escapeCsv(c.surgeryDate),
    escapeCsv(c.patientName),
    escapeCsv(c.hospitalId || c.mrn || ''),
    escapeCsv(c.age),
    escapeCsv(c.gender),
    escapeCsv(c.procedureName),
    escapeCsv(c.procedureCategory),
    escapeCsv(c.laterality),
    escapeCsv(c.diagnosis),
    escapeCsv(c.implants || ''),
    escapeCsv(c.anesthesia),
    escapeCsv(c.durationMinutes ?? ''),
    escapeCsv(c.estimatedBloodLossMl ?? ''),
    escapeCsv(c.tourniquetMinutes ?? ''),
    escapeCsv(c.hasComplication ? 'YES' : 'NO'),
    escapeCsv(c.complicationDetails ? `${c.complicationDetails.type} (${c.complicationDetails.severity})` : ''),
    escapeCsv(c.hasInfection ? 'YES' : 'NO'),
    escapeCsv(c.infectionDetails ? `${c.infectionDetails.type} - ${c.infectionDetails.organism || 'N/A'}` : ''),
    escapeCsv(c.postOpNotes),
    escapeCsv(c.specialNotes || ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OrthoLog_Surgeries_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
