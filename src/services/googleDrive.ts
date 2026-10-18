import { SurgicalCase, PeriodSummaryReport } from '../types/ortho';
import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const FOLDER_NAME = 'OrthoLog - Surgical Records';

/**
 * Finds or creates the dedicated OrthoLog folder in Google Drive
 */
export async function getOrCreateOrthoLogFolder(): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  // Search for existing folder
  const query = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!searchRes.ok) {
    const err = await searchRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to search Google Drive folders.');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Orthopedic surgical logbook backups, clinical audit summaries, and operative archives created by OrthoLog.',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create OrthoLog folder in Google Drive.');
  }

  const folderData = await createRes.json();
  return folderData.id;
}

/**
 * Helper to upload multipart file to Google Drive
 */
async function uploadMultipartFile(
  name: string,
  mimeType: string,
  content: string,
  folderId?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  const metadata: Record<string, any> = {
    name,
    mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,modifiedTime,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload file to Google Drive.');
  }

  return await res.json();
}

/**
 * Saves complete surgical case database to Google Drive as JSON
 */
export async function saveCasesBackupToDrive(cases: SurgicalCase[]): Promise<DriveFileItem> {
  const folderId = await getOrCreateOrthoLogFolder();
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  const filename = `OrthoLog_Backup_${dateStr}_${timeStr}.json`;

  const payload = {
    app: 'OrthoLog',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalCases: cases.length,
    cases,
  };

  return await uploadMultipartFile(
    filename,
    'application/json',
    JSON.stringify(payload, null, 2),
    folderId
  );
}

/**
 * Saves clinical audit summary report to Google Drive as Markdown/Text document
 */
export async function saveSummaryReportToDrive(
  report: PeriodSummaryReport,
  customTitle?: string
): Promise<DriveFileItem> {
  const folderId = await getOrCreateOrthoLogFolder();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${customTitle || 'OrthoLog_Summary_Report'}_${dateStr}.txt`;

  let content = `======================================================================
ORTHOPEDIC SURGICAL LOGBOOK & CLINICAL AUDIT REPORT
Generated: ${new Date(report.generatedAt).toLocaleString()}
Period: ${report.startDate || 'All Time'} to ${report.endDate || 'Present'}
Filter: ${report.procedureFilter !== 'all' ? report.procedureFilter : 'All Procedures'} (${report.categoryFilter !== 'all' ? report.categoryFilter : 'All Categories'})
======================================================================

1. SUMMARY STATISTICS
----------------------------------------------------------------------
Total Surgeries Performed: ${report.totalSurgeries}
Average Patient Age: ${report.averageAge} years
Complications Count: ${report.complicationsCount} (Rate: ${report.complicationRate.toFixed(1)}%)
Infections Count: ${report.infectionsCount} (Rate: ${report.infectionRate.toFixed(1)}%)

Gender Distribution:
- Male: ${report.genderCounts.Male || 0}
- Female: ${report.genderCounts.Female || 0}
- Other: ${report.genderCounts.Other || 0}

Laterality Distribution:
- Right: ${report.lateralityCounts['Right'] || 0}
- Left: ${report.lateralityCounts['Left'] || 0}
- Bilateral: ${report.lateralityCounts['Bilateral'] || 0}
- Axial / N/A: ${report.lateralityCounts['Axial / N/A'] || 0}

2. PROCEDURE BREAKDOWN & VOLUME PERCENTAGES
----------------------------------------------------------------------
${report.procedureBreakdown
  .map(
    (p, idx) =>
      `${idx + 1}. ${p.name.padEnd(45)}: ${p.count.toString().padStart(3)} cases (${p.percentage.toFixed(1)}%)`
  )
  .join('\n')}

3. COMPLICATION CASES AUDIT (${report.complicationsCount} Cases)
----------------------------------------------------------------------
${
  report.complicationCases.length === 0
    ? 'No complications recorded in this selected period.'
    : report.complicationCases
        .map(
          (c, idx) =>
            `[${idx + 1}] Date: ${c.surgeryDate} | Patient: ${c.patientName} (Age: ${c.age}, ${c.gender})
     Procedure: ${c.procedureName} (${c.laterality})
     Complication: ${c.complicationDetails?.type || 'Not specified'} (${c.complicationDetails?.timing || 'N/A'}, Severity: ${c.complicationDetails?.severity || 'N/A'})
     Description: ${c.complicationDetails?.description || 'None provided'}
     Management: ${c.complicationDetails?.management || 'None recorded'}\n`
        )
        .join('\n')
}

4. INFECTION CASES AUDIT (${report.infectionsCount} Cases)
----------------------------------------------------------------------
${
  report.infectionCases.length === 0
    ? 'No surgical infections recorded in this selected period.'
    : report.infectionCases
        .map(
          (c, idx) =>
            `[${idx + 1}] Date: ${c.surgeryDate} | Patient: ${c.patientName} (Age: ${c.age}, ${c.gender})
     Procedure: ${c.procedureName} (${c.laterality})
     Type: ${c.infectionDetails?.type || 'SSI'}
     Organism: ${c.infectionDetails?.organism || 'Culture Negative / Pending'}
     Onset: ${c.infectionDetails?.onsetDaysPostOp ? c.infectionDetails.onsetDaysPostOp + ' days post-op' : 'N/A'}
     Treatment: ${c.infectionDetails?.treatment || 'None recorded'}\n`
        )
        .join('\n')
}

======================================================================
CONFIDENTIAL - MEDICAL AUDIT RECORD - ORTHOPEDIC DEPARTMENT
======================================================================
`;

  return await uploadMultipartFile(filename, 'text/plain', content, folderId);
}

/**
 * Saves CSV table of cases to Google Drive
 */
export async function saveCsvToDrive(cases: SurgicalCase[]): Promise<DriveFileItem> {
  const folderId = await getOrCreateOrthoLogFolder();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `OrthoLog_Cases_${dateStr}.csv`;

  const headers = [
    'Surgery Date',
    'Patient Name',
    'Hospital ID',
    'Age',
    'Gender',
    'Procedure Name',
    'Subspecialty',
    'Laterality',
    'Diagnosis',
    'Implants',
    'Anesthesia',
    'Duration (min)',
    'Blood Loss (ml)',
    'Tourniquet (min)',
    'Has Complication',
    'Complication Type',
    'Complication Severity',
    'Has Infection',
    'Infection Type',
    'Infection Organism',
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
    escapeCsv(c.complicationDetails?.type || ''),
    escapeCsv(c.complicationDetails?.severity || ''),
    escapeCsv(c.hasInfection ? 'YES' : 'NO'),
    escapeCsv(c.infectionDetails?.type || ''),
    escapeCsv(c.infectionDetails?.organism || ''),
    escapeCsv(c.postOpNotes),
    escapeCsv(c.specialNotes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  return await uploadMultipartFile(filename, 'text/csv', csvContent, folderId);
}

/**
 * Lists backups in the user's OrthoLog folder in Google Drive
 */
export async function listDriveBackups(): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  const folderId = await getOrCreateOrthoLogFolder();
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&fields=files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to list Google Drive files.');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Downloads a backup file from Google Drive and parses surgical cases
 */
export async function downloadBackupCasesFromDrive(fileId: string): Promise<SurgicalCase[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Failed to download backup file from Google Drive.');
  }

  const json = await res.json();
  if (Array.isArray(json)) {
    return json;
  }
  if (json && Array.isArray(json.cases)) {
    return json.cases;
  }
  throw new Error('Invalid backup file format.');
}

/**
 * Deletes a file from Google Drive (Mandatory user confirmation handled by caller modal)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google. Please sign in first.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete file from Google Drive.');
  }
}
