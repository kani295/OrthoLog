import React, { useState, useEffect } from 'react';
import {
  SurgicalCase,
  LogbookFilterState,
} from './types/ortho';
import {
  loadCasesFromStorage,
  saveCasesToStorage,
  downloadCsvExport,
  downloadJsonExport,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { CaseList } from './components/CaseList';
import { CaseDetailModal } from './components/CaseDetailModal';
import { CaseFormModal } from './components/CaseFormModal';
import { AnalyticsView } from './components/AnalyticsView';
import { SummaryGenerator } from './components/SummaryGenerator';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { PWAInstallModal } from './components/PWAInstallModal';

export default function App() {
  const [cases, setCases] = useState<SurgicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cases' | 'analytics' | 'summary'>('cases');

  // Modals state
  const [selectedCase, setSelectedCase] = useState<SurgicalCase | null>(null);
  const [editingCase, setEditingCase] = useState<SurgicalCase | null>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Filter state for logbook
  const [filterState, setFilterState] = useState<LogbookFilterState>({
    searchQuery: '',
    dateRangePreset: 'all',
    startDate: undefined,
    endDate: undefined,
    category: 'all',
    procedureName: 'all',
    laterality: 'all',
    gender: 'all',
    onlyComplications: false,
    onlyInfections: false,
    sortBy: 'date_desc',
  });

  // Load cases from IndexedDB on startup
  useEffect(() => {
    async function init() {
      try {
        const loaded = await loadCasesFromStorage();
        setCases(loaded);
      } catch (err) {
        console.error('Failed to load cases from storage:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Save changes helper
  const handleSaveCase = async (updatedOrNewCase: SurgicalCase) => {
    let newCasesList: SurgicalCase[];
    const exists = cases.some((c) => c.id === updatedOrNewCase.id);

    if (exists) {
      newCasesList = cases.map((c) => (c.id === updatedOrNewCase.id ? updatedOrNewCase : c));
    } else {
      newCasesList = [updatedOrNewCase, ...cases];
    }

    setCases(newCasesList);
    await saveCasesToStorage(newCasesList);
    setIsNewCaseOpen(false);
    setEditingCase(null);
    if (selectedCase && selectedCase.id === updatedOrNewCase.id) {
      setSelectedCase(updatedOrNewCase);
    }
  };

  const handleDeleteCase = async (id: string) => {
    const updated = cases.filter((c) => c.id !== id);
    setCases(updated);
    await saveCasesToStorage(updated);
    if (selectedCase && selectedCase.id === id) {
      setSelectedCase(null);
    }
  };

  const handleRestoreFromDrive = async (restoredCases: SurgicalCase[]) => {
    // Merge or replace
    const caseMap = new Map<string, SurgicalCase>();
    cases.forEach((c) => caseMap.set(c.id, c));
    restoredCases.forEach((c) => caseMap.set(c.id, c));
    const merged = Array.from(caseMap.values());

    setCases(merged);
    await saveCasesToStorage(merged);
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedList: SurgicalCase[] = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.cases)
          ? parsed.cases
          : [];

        if (importedList.length === 0) {
          alert('No valid surgical cases found in the uploaded file.');
          return;
        }

        await handleRestoreFromDrive(importedList);
        alert(`Successfully imported ${importedList.length} cases.`);
      } catch (err: any) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Drill-down navigation from Analytics
  const handleDrillDownComplications = () => {
    setFilterState((prev) => ({
      ...prev,
      onlyComplications: true,
      onlyInfections: false,
      searchQuery: '',
      category: 'all',
      procedureName: 'all',
    }));
    setActiveTab('cases');
  };

  const handleDrillDownInfections = () => {
    setFilterState((prev) => ({
      ...prev,
      onlyInfections: true,
      onlyComplications: false,
      searchQuery: '',
      category: 'all',
      procedureName: 'all',
    }));
    setActiveTab('cases');
  };

  const handleDrillDownProcedure = (procName: string) => {
    setFilterState((prev) => ({
      ...prev,
      procedureName: procName,
      onlyComplications: false,
      onlyInfections: false,
    }));
    setActiveTab('cases');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewCase={() => {
          setEditingCase(null);
          setIsNewCaseOpen(true);
        }}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onExportJson={() => downloadJsonExport(cases)}
        onImportJson={handleImportJson}
        caseCount={cases.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="py-24 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading surgical database & imaging records...</p>
          </div>
        ) : (
          <>
            {activeTab === 'cases' && (
              <CaseList
                cases={cases}
                onSelectCase={(c) => setSelectedCase(c)}
                onEditCase={(c) => {
                  setEditingCase(c);
                  setIsNewCaseOpen(true);
                }}
                onAddNew={() => {
                  setEditingCase(null);
                  setIsNewCaseOpen(true);
                }}
                onExportCsv={() => downloadCsvExport(cases)}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
                filterState={filterState}
                setFilterState={setFilterState}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                cases={cases}
                onDrillDownComplications={handleDrillDownComplications}
                onDrillDownInfections={handleDrillDownInfections}
                onDrillDownProcedure={handleDrillDownProcedure}
              />
            )}

            {activeTab === 'summary' && (
              <SummaryGenerator
                cases={cases}
                onSelectCase={(c) => setSelectedCase(c)}
                onOpenGoogleDriveModal={() => setIsDriveModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 print:hidden text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>OrthoLog · Orthopedic Surgical Logbook & Quality Governance</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => downloadJsonExport(cases)}
              className="hover:text-slate-300 transition underline"
            >
              Export JSON Backup
            </button>
            <label className="hover:text-slate-300 transition underline cursor-pointer">
              Import JSON
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
            <button
              onClick={() => downloadCsvExport(cases)}
              className="hover:text-slate-300 transition underline"
            >
              Export CSV Spreadsheet
            </button>
          </div>
        </div>
      </footer>

      {/* Case Details Modal */}
      {selectedCase && (
        <CaseDetailModal
          surgicalCase={selectedCase}
          onEdit={(c) => {
            setSelectedCase(null);
            setEditingCase(c);
            setIsNewCaseOpen(true);
          }}
          onDelete={handleDeleteCase}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {/* Case Form Modal (Add / Edit) */}
      {isNewCaseOpen && (
        <CaseFormModal
          initialCase={editingCase}
          onSave={handleSaveCase}
          onClose={() => {
            setIsNewCaseOpen(false);
            setEditingCase(null);
          }}
        />
      )}

      {/* Google Drive Integration Modal */}
      {isDriveModalOpen && (
        <GoogleDriveSyncModal
          cases={cases}
          onRestoreCases={handleRestoreFromDrive}
          onClose={() => setIsDriveModalOpen(false)}
        />
      )}

      {/* PWA / Android APK Installation Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
