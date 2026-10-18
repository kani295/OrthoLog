import React, { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  Scissors,
  TrendingUp,
  Clock,
  Droplet,
  Users,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { SurgicalCase } from '../types/ortho';
import { computeAnalytics } from '../utils/analytics';

interface Props {
  cases: SurgicalCase[];
  onDrillDownComplications: () => void;
  onDrillDownInfections: () => void;
  onDrillDownProcedure: (procName: string) => void;
}

export const AnalyticsView: React.FC<Props> = ({
  cases,
  onDrillDownComplications,
  onDrillDownInfections,
  onDrillDownProcedure,
}) => {
  const analytics = useMemo(() => computeAnalytics(cases), [cases]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            Clinical Governance & Surgical Audit
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Surgical Volumes, Complications & Infection Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time statistical breakdown across {analytics.totalSurgeries} recorded orthopedic operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDrillDownComplications}
            disabled={analytics.totalSurgeries === 0}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Review Complications ({analytics.overallComplicationCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDrillDownInfections}
            disabled={analytics.totalSurgeries === 0}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Review Infections ({analytics.overallInfectionCount})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {analytics.totalSurgeries === 0 && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2">
          <div className="text-sm font-semibold text-slate-200">
            📊 Blank Sheet Active — Ready for Analytics
          </div>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            You currently have no cases recorded. Once you start logging surgeries, your surgical procedure percentages, complication rates, infection audit benchmarks, and average operative times will automatically calculate and display here.
          </p>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Surgeries</span>
            <Scissors className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-white font-mono">
              {analytics.totalSurgeries}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Avg Patient Age: <strong className="text-slate-200">{analytics.averageAge} yrs</strong>
            </div>
          </div>
        </div>

        {/* Complication Rate */}
        <div
          onClick={onDrillDownComplications}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="group-hover:text-amber-300 transition">Complication Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-amber-400 font-mono flex items-baseline gap-1.5">
              <span>{analytics.overallComplicationRate.toFixed(1)}%</span>
              <span className="text-xs font-sans text-slate-400 font-normal">
                ({analytics.overallComplicationCount} cases)
              </span>
            </div>
            <div className="text-xs text-amber-300/80 mt-1 flex items-center gap-1 font-medium">
              Click to inspect cases <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Infection Rate */}
        <div
          onClick={onDrillDownInfections}
          className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="group-hover:text-rose-300 transition">Infection Rate (SSI)</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-rose-400 font-mono flex items-baseline gap-1.5">
              <span>{analytics.overallInfectionRate.toFixed(1)}%</span>
              <span className="text-xs font-sans text-slate-400 font-normal">
                ({analytics.overallInfectionCount} cases)
              </span>
            </div>
            <div className="text-xs text-rose-300/80 mt-1 flex items-center gap-1 font-medium">
              Click to inspect cases <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Operating Room Averages */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Operative Efficiency</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <div className="text-3xl font-extrabold text-white font-mono">
              {analytics.averageDurationMinutes}
              <span className="text-sm font-sans text-slate-400 font-normal ml-1">min avg</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Avg EBL: <strong className="text-slate-200">{analytics.averageBloodLossMl} mL</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Procedure Percentages & Safety Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Procedure Percentages & Volume Breakdown */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Surgical Procedure Volume Breakdown & Percentages
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proportion of practice volume with specific complication & infection frequencies
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.procedureMetrics.map((proc) => (
              <div
                key={proc.name}
                onClick={() => onDrillDownProcedure(proc.name)}
                className="group p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-teal-500/50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="font-semibold text-white group-hover:text-teal-300 transition truncate max-w-[70%]">
                    {proc.name}
                  </div>
                  <div className="font-mono text-slate-300 font-medium">
                    <span className="text-white font-bold">{proc.count}</span> cases ({proc.percentage.toFixed(1)}%)
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(proc.percentage, 3)}%` }}
                  />
                </div>

                {/* Micro-metrics */}
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                    {proc.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        proc.complicationsCount > 0 ? 'text-amber-400 font-medium' : 'text-slate-500'
                      }
                    >
                      Complications: {proc.complicationsCount} ({proc.complicationRate.toFixed(1)}%)
                    </span>
                    <span
                      className={
                        proc.infectionsCount > 0 ? 'text-rose-400 font-medium' : 'text-slate-500'
                      }
                    >
                      Infections: {proc.infectionsCount} ({proc.infectionRate.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Subspecialty, Laterality, Demographics */}
        <div className="space-y-6">
          {/* Subspecialties Mix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scissors className="w-4 h-4 text-teal-400" />
              Subspecialty Mix
            </h3>
            <div className="space-y-2.5">
              {analytics.categoryMetrics.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate">{cat.category}</span>
                    <span className="font-mono text-slate-400">
                      {cat.count} ({cat.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-sky-500 h-1.5 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laterality Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              Laterality & Demographics
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Right Side:</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {analytics.lateralityMetrics.Right.count} (
                  {analytics.lateralityMetrics.Right.percentage.toFixed(0)}%)
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Left Side:</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {analytics.lateralityMetrics.Left.count} (
                  {analytics.lateralityMetrics.Left.percentage.toFixed(0)}%)
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Bilateral:</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {analytics.lateralityMetrics.Bilateral.count} (
                  {analytics.lateralityMetrics.Bilateral.percentage.toFixed(0)}%)
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Axial / N/A:</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {analytics.lateralityMetrics['Axial / N/A'].count} (
                  {analytics.lateralityMetrics['Axial / N/A'].percentage.toFixed(0)}%)
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs flex justify-between text-slate-400">
              <span>
                Male: <strong className="text-white">{analytics.genderMetrics.Male.count}</strong> (
                {analytics.genderMetrics.Male.percentage.toFixed(0)}%)
              </span>
              <span>
                Female:{' '}
                <strong className="text-white">{analytics.genderMetrics.Female.count}</strong> (
                {analytics.genderMetrics.Female.percentage.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Complications & Infections Root Cause Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Complication Etiology */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Complication Etiology Breakdown
            </h3>
            <button
              onClick={onDrillDownComplications}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              Inspect all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {analytics.complicationTypeCounts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Zero surgical complications recorded. Excellent clinical record.
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.complicationTypeCounts.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs"
                >
                  <span className="text-slate-300 font-medium truncate max-w-[75%]">{item.type}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infection Microbiology & SSI */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Surgical Site Infection Classification
            </h3>
            <button
              onClick={onDrillDownInfections}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
            >
              Inspect all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {analytics.infectionTypeCounts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Zero surgical site infections recorded.
            </div>
          ) : (
            <div className="space-y-2">
              {analytics.infectionTypeCounts.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs"
                >
                  <span className="text-slate-300 font-medium truncate max-w-[75%]">{item.type}</span>
                  <span className="font-mono font-bold text-rose-400">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
