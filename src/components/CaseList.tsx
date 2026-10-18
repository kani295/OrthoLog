import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Activity,
  Calendar,
  ChevronDown,
  Plus,
  Eye,
  Scissors,
  FileSpreadsheet,
  Download,
  CheckCircle,
  X,
  SlidersHorizontal,
  Image as ImageIcon,
  Smartphone,
  ClipboardList,
} from 'lucide-react';
import {
  SurgicalCase,
  LogbookFilterState,
  ProcedureCategory,
  Laterality,
  Gender,
} from '../types/ortho';

interface Props {
  cases: SurgicalCase[];
  onSelectCase: (c: SurgicalCase) => void;
  onEditCase: (c: SurgicalCase) => void;
  onAddNew: () => void;
  onExportCsv: () => void;
  onOpenInstallModal?: () => void;
  filterState: LogbookFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<LogbookFilterState>>;
}

export const CaseList: React.FC<Props> = ({
  cases,
  onSelectCase,
  onEditCase,
  onAddNew,
  onExportCsv,
  onOpenInstallModal,
  filterState,
  setFilterState,
}) => {
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Extract distinct procedure names for filter dropdown
  const uniqueProcedures = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => set.add(c.procedureName));
    return Array.from(set).sort();
  }, [cases]);

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // 1. Text Search (Patient name, MRN, procedure, diagnosis, implants, notes)
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matchName = c.patientName.toLowerCase().includes(q);
        const matchId = (c.hospitalId || c.mrn || '').toLowerCase().includes(q);
        const matchProc = c.procedureName.toLowerCase().includes(q);
        const matchDiag = c.diagnosis.toLowerCase().includes(q);
        const matchImp = c.implants?.toLowerCase().includes(q) || false;
        const matchNotes = c.postOpNotes.toLowerCase().includes(q) || false;
        const matchSpecial = c.specialNotes?.toLowerCase().includes(q) || false;
        const matchComp = c.complicationDetails?.description.toLowerCase().includes(q) || false;
        const matchInf = c.infectionDetails?.treatment.toLowerCase().includes(q) || false;

        if (
          !matchName &&
          !matchId &&
          !matchProc &&
          !matchDiag &&
          !matchImp &&
          !matchNotes &&
          !matchSpecial &&
          !matchComp &&
          !matchInf
        ) {
          return false;
        }
      }

      // 2. Complications only
      if (filterState.onlyComplications && !c.hasComplication) {
        return false;
      }

      // 3. Infections only
      if (filterState.onlyInfections && !c.hasInfection) {
        return false;
      }

      // 4. Subspecialty category
      if (filterState.category !== 'all' && c.procedureCategory !== filterState.category) {
        return false;
      }

      // 5. Specific Procedure
      if (filterState.procedureName !== 'all' && c.procedureName !== filterState.procedureName) {
        return false;
      }

      // 6. Laterality
      if (filterState.laterality !== 'all' && c.laterality !== filterState.laterality) {
        return false;
      }

      // 7. Gender
      if (filterState.gender !== 'all' && c.gender !== filterState.gender) {
        return false;
      }

      // 8. Date ranges
      if (filterState.startDate && c.surgeryDate < filterState.startDate) {
        return false;
      }
      if (filterState.endDate && c.surgeryDate > filterState.endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'date_asc') {
        return a.surgeryDate.localeCompare(b.surgeryDate);
      }
      if (filterState.sortBy === 'patient_name') {
        return a.patientName.localeCompare(b.patientName);
      }
      if (filterState.sortBy === 'duration_desc') {
        return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      }
      // default: date_desc
      return b.surgeryDate.localeCompare(a.surgeryDate);
    });
  }, [cases, filterState]);

  // Counts for quick badges
  const totalComplications = useMemo(() => cases.filter((c) => c.hasComplication).length, [cases]);
  const totalInfections = useMemo(() => cases.filter((c) => c.hasInfection).length, [cases]);

  // Apply date range presets
  const applyDatePreset = (preset: LogbookFilterState['dateRangePreset']) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setFilterState((prev) => ({ ...prev, dateRangePreset: 'all', startDate: undefined, endDate: undefined }));
    } else if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setFilterState((prev) => ({ ...prev, dateRangePreset: 'this_month', startDate: start, endDate: todayStr }));
    } else if (preset === 'last_3_months') {
      const start = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split('T')[0];
      setFilterState((prev) => ({ ...prev, dateRangePreset: 'last_3_months', startDate: start, endDate: todayStr }));
    } else if (preset === 'this_year') {
      const start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      setFilterState((prev) => ({ ...prev, dateRangePreset: 'this_year', startDate: start, endDate: todayStr }));
    } else {
      setFilterState((prev) => ({ ...prev, dateRangePreset: preset }));
    }
  };

  const resetFilters = () => {
    setFilterState({
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
  };

  const hasActiveFilters =
    filterState.searchQuery ||
    filterState.category !== 'all' ||
    filterState.procedureName !== 'all' ||
    filterState.laterality !== 'all' ||
    filterState.gender !== 'all' ||
    filterState.onlyComplications ||
    filterState.onlyInfections ||
    filterState.dateRangePreset !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Primary Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Robust Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search patients by name, Hospital ID, procedure, implant, notes, or pathology..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
            />
            {filterState.searchQuery && (
              <button
                onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showFiltersDrawer || hasActiveFilters
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              )}
            </button>

            <button
              onClick={onExportCsv}
              className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Export all matching cases to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onAddNew}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-950 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Surgery</span>
            </button>
          </div>
        </div>

        {/* Quick Safety Filter Badges (User requested: "Need to be able to go back to the cases where there was complications or infections, where i am able to quickly search those") */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase tracking-wider">
            Quick Audit:
          </span>

          <button
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                onlyComplications: !prev.onlyComplications,
              }))
            }
            className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              filterState.onlyComplications
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 font-bold shadow-sm shadow-amber-950'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-amber-500/40 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Complications ({totalComplications})</span>
          </button>

          <button
            onClick={() =>
              setFilterState((prev) => ({
                ...prev,
                onlyInfections: !prev.onlyInfections,
              }))
            }
            className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
              filterState.onlyInfections
                ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold shadow-sm shadow-rose-950'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-rose-500/40 hover:text-rose-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Infections ({totalInfections})</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Subspecialty Quick Pills */}
          {(['Arthroplasty', 'Sports & Arthroscopy', 'Trauma & Fractures', 'Spine'] as ProcedureCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() =>
                  setFilterState((prev) => ({
                    ...prev,
                    category: prev.category === cat ? 'all' : cat,
                  }))
                }
                className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition cursor-pointer ${
                  filterState.category === cat
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500 font-semibold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-[11px] text-teal-400 hover:text-teal-300 underline font-medium"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Extended Filter Drawer */}
        {showFiltersDrawer && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Date Range Preset */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Period Filter</label>
              <select
                value={filterState.dateRangePreset}
                onChange={(e) => applyDatePreset(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Dates</option>
                <option value="this_month">This Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="this_year">This Year</option>
                <option value="custom">Custom Date Range</option>
              </select>
            </div>

            {/* Custom Dates if selected */}
            {filterState.dateRangePreset === 'custom' && (
              <div className="sm:col-span-2 flex items-center gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">From</label>
                  <input
                    type="date"
                    value={filterState.startDate || ''}
                    onChange={(e) => setFilterState((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">To</label>
                  <input
                    type="date"
                    value={filterState.endDate || ''}
                    onChange={(e) => setFilterState((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white"
                  />
                </div>
              </div>
            )}

            {/* Specific Procedure */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Specific Procedure</label>
              <select
                value={filterState.procedureName}
                onChange={(e) => setFilterState((prev) => ({ ...prev, procedureName: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Procedures</option>
                {uniqueProcedures.map((proc) => (
                  <option key={proc} value={proc}>
                    {proc}
                  </option>
                ))}
              </select>
            </div>

            {/* Laterality */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Laterality</label>
              <select
                value={filterState.laterality}
                onChange={(e) => setFilterState((prev) => ({ ...prev, laterality: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Sides</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Bilateral">Bilateral</option>
                <option value="Axial / N/A">Axial / N/A</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Sort Order</label>
              <select
                value={filterState.sortBy}
                onChange={(e) => setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="date_desc">Surgery Date (Newest first)</option>
                <option value="date_asc">Surgery Date (Oldest first)</option>
                <option value="patient_name">Patient Name (A-Z)</option>
                <option value="duration_desc">Longest Duration</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Case Count & Filter Summary */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredCases.length}</span> of{' '}
          <span className="font-bold text-white">{cases.length}</span> total surgical cases
        </div>
        {filteredCases.length > 0 && (
          <div className="flex items-center gap-3">
            <span>
              Complications in view:{' '}
              <strong className="text-amber-400">
                {filteredCases.filter((c) => c.hasComplication).length}
              </strong>
            </span>
            <span>
              Infections in view:{' '}
              <strong className="text-rose-400">
                {filteredCases.filter((c) => c.hasInfection).length}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Cases Cards List */}
      {cases.length === 0 ? (
        <div className="p-8 sm:p-14 text-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <CheckCircle className="w-3.5 h-3.5" />
              Blank Sheet Active — Ready for Real Surgeries
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Your Surgical Logbook is Clean & Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All previous sample data has been removed. You now have a blank sheet to record your surgical cases, attach pre/post-op X-rays, CT scans, and video cine loops, track complications/infections, and sync with Google Drive.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onAddNew}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/25 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Your First Surgery</span>
            </button>
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-teal-400" />
                <span>Install Mobile / Desktop App (APK)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-left max-w-2xl mx-auto">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-200">Patient & Procedure</div>
              <div className="text-[11px] text-slate-400">Record demographics, Hospital ID, implants, surgical approach, and operative times</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-200">PACS & Video Cine</div>
              <div className="text-[11px] text-slate-400">Attach X-rays, CT scans, and video cine loops with bone & soft-tissue windowing</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="text-xs font-semibold text-slate-200">Google Drive & Audits</div>
              <div className="text-[11px] text-slate-400">One-click cloud backup, CSV exports, complication tracking, and infection rate reports</div>
            </div>
          </div>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No surgical cases match your criteria</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search terms, clearing date filters, or logging a new procedure.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className="bg-slate-900 border border-slate-800 hover:border-teal-500/60 rounded-xl p-4 transition duration-150 cursor-pointer shadow-md group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Left Column: Demographics & Procedure Details */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                    {c.patientName}
                  </span>
                  <span className="font-mono text-xs text-slate-300 px-2 py-0.5 rounded bg-slate-950 border border-slate-800" title="Hospital ID">
                    ID: {c.hospitalId || c.mrn}
                  </span>
                  <span className="text-xs text-slate-400">
                    {c.age}y / {c.gender}
                  </span>

                  {/* Complication Badge */}
                  {c.hasComplication && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Complication: {c.complicationDetails?.type.split('/')[0]}
                    </span>
                  )}

                  {/* Infection Badge */}
                  {c.hasInfection && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3 text-rose-400" />
                      Infection: {c.infectionDetails?.type.split('/')[0]}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-teal-300">{c.procedureName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                    {c.laterality}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{c.procedureCategory}</span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">
                  <strong className="text-slate-300">Indication:</strong> {c.diagnosis}
                </p>

                {c.implants && (
                  <p className="text-[11px] text-slate-500 font-mono line-clamp-1">
                    Implants: {c.implants}
                  </p>
                )}
              </div>

              {/* Right Column: Date, Duration, Attachments, Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                <div className="text-left md:text-right">
                  <div className="text-xs font-mono font-medium text-slate-300 flex items-center md:justify-end gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-400" />
                    {c.surgeryDate}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {c.durationMinutes ? `${c.durationMinutes} min` : 'Duration N/A'}
                    {c.estimatedBloodLossMl ? ` · ${c.estimatedBloodLossMl} mL EBL` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {c.attachments.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[11px] flex items-center gap-1 font-mono">
                      <ImageIcon className="w-3 h-3" />
                      {c.attachments.length} {c.attachments.length === 1 ? 'image' : 'images'}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCase(c);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs"
                    title="Edit Case"
                  >
                    Edit
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(c);
                    }}
                    className="p-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 transition text-xs font-medium flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
