import React, { useState, useMemo } from 'react';
import {
  FileText,
  Calendar,
  Printer,
  Cloud,
  Download,
  AlertTriangle,
  Activity,
  Scissors,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { SurgicalCase, ProcedureCategory } from '../types/ortho';
import { generatePeriodSummary } from '../utils/analytics';
import { saveSummaryReportToDrive } from '../services/googleDrive';
import { getAccessToken } from '../services/firebaseAuth';

interface Props {
  cases: SurgicalCase[];
  onSelectCase: (c: SurgicalCase) => void;
  onOpenGoogleDriveModal: () => void;
}

export const SummaryGenerator: React.FC<Props> = ({
  cases,
  onSelectCase,
  onOpenGoogleDriveModal,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [procedureFilter, setProcedureFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveMessage, setDriveSaveMessage] = useState<string | null>(null);

  // Distinct procedures list
  const uniqueProcedures = useMemo(() => {
    const set = new Set<string>();
    cases.forEach((c) => set.add(c.procedureName));
    return Array.from(set).sort();
  }, [cases]);

  // Generate period summary
  const summary = useMemo(() => {
    return generatePeriodSummary(cases, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      procedureFilter,
      categoryFilter,
    });
  }, [cases, startDate, endDate, procedureFilter, categoryFilter]);

  const handleApplyPreset = (preset: 'all' | 'this_month' | 'this_year' | 'last_year') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(todayStr);
    } else if (preset === 'this_year') {
      const start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(todayStr);
    } else if (preset === 'last_year') {
      const start = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
      const end = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    const token = await getAccessToken();
    if (!token) {
      onOpenGoogleDriveModal();
      return;
    }

    try {
      setIsSavingToDrive(true);
      setDriveSaveMessage(null);
      const title = `OrthoLog_Audit_${summary.startDate || 'All'}_to_${summary.endDate || 'Now'}`;
      const file = await saveSummaryReportToDrive(summary, title);
      setDriveSaveMessage(`Report saved to your Google Drive as "${file.name}"!`);
    } catch (err: any) {
      setDriveSaveMessage(`Failed to save to Drive: ${err?.message || 'Error'}`);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls (hidden during print) */}
      <div className="print:hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              Period & Procedure Summary Generator
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Clinical Audit & Surgical Logbook Report
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate structured period reports with case mix percentages, complication rates, and infection audits
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print formatted audit report or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleSaveToDrive}
              disabled={isSavingToDrive}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-950 transition disabled:opacity-50"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isSavingToDrive ? 'Saving...' : 'Save Report to Drive'}</span>
            </button>
          </div>
        </div>

        {/* Filter Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Procedure Type</label>
            <select
              value={procedureFilter}
              onChange={(e) => setProcedureFilter(e.target.value)}
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

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Subspecialty Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="all">All Subspecialties</option>
              <option value="Arthroplasty">Arthroplasty</option>
              <option value="Sports & Arthroscopy">Sports & Arthroscopy</option>
              <option value="Trauma & Fractures">Trauma & Fractures</option>
              <option value="Spine">Spine</option>
              <option value="Foot & Ankle">Foot & Ankle</option>
              <option value="Hand & Upper Limb">Hand & Upper Limb</option>
              <option value="Pediatric Orthopedics">Pediatric Orthopedics</option>
              <option value="General Orthopedics">General Orthopedics</option>
            </select>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-[11px] text-slate-400">Quick period presets:</span>
          <button
            onClick={() => handleApplyPreset('all')}
            className={`px-2.5 py-1 rounded-full border text-[11px] transition ${
              !startDate && !endDate
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handleApplyPreset('this_month')}
            className="px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950 hover:text-white text-slate-400 text-[11px] transition"
          >
            This Month
          </button>
          <button
            onClick={() => handleApplyPreset('this_year')}
            className="px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950 hover:text-white text-slate-400 text-[11px] transition"
          >
            This Year (YTD)
          </button>
          <button
            onClick={() => handleApplyPreset('last_year')}
            className="px-2.5 py-1 rounded-full border border-slate-800 bg-slate-950 hover:text-white text-slate-400 text-[11px] transition"
          >
            Last Year
          </button>
        </div>

        {driveSaveMessage && (
          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-teal-400" />
            <span>{driveSaveMessage}</span>
          </div>
        )}
      </div>

      {/* Printable Clinical Audit Report Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 print:border-black">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs uppercase tracking-widest text-teal-400 font-mono font-bold print:text-slate-700">
                Orthopedic Surgery Clinical Audit & Performance Summary
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1 print:text-black">
                Surgical Logbook Audit Report
              </h1>
              <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                Audited Period:{' '}
                <strong className="text-slate-200 print:text-black">
                  {summary.startDate || 'Beginning of Records'} to {summary.endDate || 'Present'}
                </strong>
                {' · '}
                Filter:{' '}
                <strong className="text-slate-200 print:text-black">
                  {summary.procedureFilter !== 'all' ? summary.procedureFilter : 'All Procedures'}
                </strong>{' '}
                ({summary.categoryFilter !== 'all' ? summary.categoryFilter : 'All Specialties'})
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-600">
              <div>Date Generated: {new Date(summary.generatedAt).toLocaleDateString()}</div>
              <div className="font-mono text-[10px] text-slate-500 print:text-slate-500 mt-0.5">
                STATUS: CERTIFIED
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 print:border-slate-300 print:bg-slate-50">
            <div className="text-xs text-slate-400 print:text-slate-600">Total Cases in Period</div>
            <div className="text-2xl font-extrabold text-white font-mono mt-1 print:text-black">
              {summary.totalSurgeries}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Avg Age: <strong>{summary.averageAge} yrs</strong>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 print:border-slate-300 print:bg-slate-50">
            <div className="text-xs text-slate-400 print:text-slate-600">Complications Count</div>
            <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1 print:text-black">
              {summary.complicationsCount}
            </div>
            <div className="text-[11px] text-amber-300 print:text-slate-700 font-semibold mt-1">
              Rate: {summary.complicationRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 print:border-slate-300 print:bg-slate-50">
            <div className="text-xs text-slate-400 print:text-slate-600">Infections (SSI) Count</div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono mt-1 print:text-black">
              {summary.infectionsCount}
            </div>
            <div className="text-[11px] text-rose-300 print:text-slate-700 font-semibold mt-1">
              Rate: {summary.infectionRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 print:border-slate-300 print:bg-slate-50">
            <div className="text-xs text-slate-400 print:text-slate-600">Laterality Ratio</div>
            <div className="text-sm font-semibold text-white mt-1 print:text-black">
              R: {summary.lateralityCounts.Right || 0} | L: {summary.lateralityCounts.Left || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Bilat: {summary.lateralityCounts.Bilateral || 0} | Axial: {summary.lateralityCounts['Axial / N/A'] || 0}
            </div>
          </div>
        </div>

        {/* Section 1: Procedure Volume & Percentages Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            1. Surgical Procedures Mix & Volume Percentages
          </h3>
          <div className="w-full border border-slate-800 rounded-xl print:border-slate-300 overflow-hidden">
            <table className="w-full table-auto text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 print:bg-slate-100 print:text-slate-700 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">#</th>
                  <th className="py-2.5 px-4 font-semibold">Procedure Description</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Case Count</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {summary.procedureBreakdown.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-2 px-4 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="py-2 px-4 font-medium text-white print:text-black">{item.name}</td>
                    <td className="py-2 px-4 text-right font-mono text-slate-300 print:text-black font-semibold">
                      {item.count}
                    </td>
                    <td className="py-2 px-4 text-right font-mono text-teal-400 print:text-slate-800 font-bold">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Complications Cases Detail */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            2. Detailed Complications Review ({summary.complicationCases.length} Cases)
          </h3>

          {summary.complicationCases.length === 0 ? (
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500 text-center print:border-slate-200 print:text-slate-600">
              No complications were encountered in the audited period.
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.complicationCases.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="p-3.5 bg-slate-950/70 border border-amber-500/30 rounded-xl text-xs space-y-1.5 cursor-pointer hover:border-amber-400 transition print:bg-transparent print:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white print:text-black">
                        [{idx + 1}] {c.patientName}
                      </span>
                      <span className="font-mono text-slate-400">(ID: {c.hospitalId || c.mrn})</span>
                      <span className="text-slate-400">
                        {c.age}y / {c.gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-slate-400">{c.surgeryDate}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold print:text-black">
                        {c.complicationDetails?.severity}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-300 print:text-black font-medium">
                    {c.procedureName} ({c.laterality})
                  </div>

                  <div className="text-slate-400 print:text-slate-800">
                    <strong className="text-amber-300 print:text-black">Complication:</strong>{' '}
                    {c.complicationDetails?.type} · <em>{c.complicationDetails?.description}</em>
                  </div>

                  <div className="text-slate-400 print:text-slate-800">
                    <strong className="text-teal-300 print:text-black">Management:</strong>{' '}
                    {c.complicationDetails?.management}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Infections Detail */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 print:text-slate-800 flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            3. Detailed Surgical Site Infections Review ({summary.infectionCases.length} Cases)
          </h3>

          {summary.infectionCases.length === 0 ? (
            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500 text-center print:border-slate-200 print:text-slate-600">
              No surgical site infections were documented in the audited period.
            </div>
          ) : (
            <div className="space-y-2.5">
              {summary.infectionCases.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="p-3.5 bg-slate-950/70 border border-rose-500/30 rounded-xl text-xs space-y-1.5 cursor-pointer hover:border-rose-400 transition print:bg-transparent print:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white print:text-black">
                        [{idx + 1}] {c.patientName}
                      </span>
                      <span className="font-mono text-slate-400">(ID: {c.hospitalId || c.mrn})</span>
                      <span className="text-slate-400">
                        {c.age}y / {c.gender}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono text-slate-400">{c.surgeryDate}</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold print:text-black">
                        {c.infectionDetails?.type}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-300 print:text-black font-medium">
                    {c.procedureName} ({c.laterality})
                  </div>

                  <div className="text-slate-400 print:text-slate-800">
                    <strong className="text-rose-300 print:text-black">Microbiology / Organism:</strong>{' '}
                    {c.infectionDetails?.organism || 'Culture Negative / Pending'} (Onset:{' '}
                    {c.infectionDetails?.onsetDaysPostOp} days)
                  </div>

                  <div className="text-slate-400 print:text-slate-800">
                    <strong className="text-teal-300 print:text-black">Treatment Regimen:</strong>{' '}
                    {c.infectionDetails?.treatment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between print:border-slate-300 print:text-slate-600">
          <div>Confidential Medical Audit Document · Orthopedic Surgical Department</div>
          <div>Page 1 of 1</div>
        </div>
      </div>
    </div>
  );
};
