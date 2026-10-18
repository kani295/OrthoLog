import {
  SurgicalCase,
  PeriodSummaryReport,
  Gender,
  Laterality,
  ProcedureCategory,
} from '../types/ortho';

export interface ProcedureMetric {
  name: string;
  category: ProcedureCategory;
  count: number;
  percentage: number;
  complicationsCount: number;
  complicationRate: number;
  infectionsCount: number;
  infectionRate: number;
}

export interface AnalyticsSummary {
  totalSurgeries: number;
  overallComplicationCount: number;
  overallComplicationRate: number;
  overallInfectionCount: number;
  overallInfectionRate: number;
  procedureMetrics: ProcedureMetric[];
  categoryMetrics: {
    category: ProcedureCategory;
    count: number;
    percentage: number;
    complicationsCount: number;
    infectionsCount: number;
  }[];
  lateralityMetrics: Record<Laterality, { count: number; percentage: number }>;
  genderMetrics: Record<Gender, { count: number; percentage: number }>;
  averageAge: number;
  averageDurationMinutes: number;
  averageBloodLossMl: number;
  complicationTypeCounts: { type: string; count: number; percentage: number }[];
  infectionTypeCounts: { type: string; count: number; percentage: number }[];
  monthlyTrend: {
    monthKey: string;
    label: string;
    total: number;
    complications: number;
    infections: number;
  }[];
}

export function computeAnalytics(cases: SurgicalCase[]): AnalyticsSummary {
  const total = cases.length;
  if (total === 0) {
    return {
      totalSurgeries: 0,
      overallComplicationCount: 0,
      overallComplicationRate: 0,
      overallInfectionCount: 0,
      overallInfectionRate: 0,
      procedureMetrics: [],
      categoryMetrics: [],
      lateralityMetrics: {
        Left: { count: 0, percentage: 0 },
        Right: { count: 0, percentage: 0 },
        Bilateral: { count: 0, percentage: 0 },
        'Axial / N/A': { count: 0, percentage: 0 },
      },
      genderMetrics: {
        Male: { count: 0, percentage: 0 },
        Female: { count: 0, percentage: 0 },
        Other: { count: 0, percentage: 0 },
      },
      averageAge: 0,
      averageDurationMinutes: 0,
      averageBloodLossMl: 0,
      complicationTypeCounts: [],
      infectionTypeCounts: [],
      monthlyTrend: [],
    };
  }

  const complicationCases = cases.filter((c) => c.hasComplication);
  const infectionCases = cases.filter((c) => c.hasInfection);

  const overallComplicationCount = complicationCases.length;
  const overallComplicationRate = (overallComplicationCount / total) * 100;
  const overallInfectionCount = infectionCases.length;
  const overallInfectionRate = (overallInfectionCount / total) * 100;

  // Procedure grouping
  const procMap = new Map<
    string,
    {
      category: ProcedureCategory;
      count: number;
      complications: number;
      infections: number;
    }
  >();

  for (const c of cases) {
    const key = c.procedureName.trim();
    const existing = procMap.get(key) || {
      category: c.procedureCategory,
      count: 0,
      complications: 0,
      infections: 0,
    };
    existing.count += 1;
    if (c.hasComplication) existing.complications += 1;
    if (c.hasInfection) existing.infections += 1;
    procMap.set(key, existing);
  }

  const procedureMetrics: ProcedureMetric[] = Array.from(procMap.entries())
    .map(([name, data]) => ({
      name,
      category: data.category,
      count: data.count,
      percentage: (data.count / total) * 100,
      complicationsCount: data.complications,
      complicationRate: data.count > 0 ? (data.complications / data.count) * 100 : 0,
      infectionsCount: data.infections,
      infectionRate: data.count > 0 ? (data.infections / data.count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Category grouping
  const catMap = new Map<ProcedureCategory, { count: number; complications: number; infections: number }>();
  for (const c of cases) {
    const existing = catMap.get(c.procedureCategory) || { count: 0, complications: 0, infections: 0 };
    existing.count += 1;
    if (c.hasComplication) existing.complications += 1;
    if (c.hasInfection) existing.infections += 1;
    catMap.set(c.procedureCategory, existing);
  }

  const categoryMetrics = Array.from(catMap.entries())
    .map(([cat, val]) => ({
      category: cat,
      count: val.count,
      percentage: (val.count / total) * 100,
      complicationsCount: val.complications,
      infectionsCount: val.infections,
    }))
    .sort((a, b) => b.count - a.count);

  // Laterality metrics
  const lateralityCounts: Record<Laterality, number> = {
    Left: 0,
    Right: 0,
    Bilateral: 0,
    'Axial / N/A': 0,
  };
  for (const c of cases) {
    if (c.laterality in lateralityCounts) {
      lateralityCounts[c.laterality] += 1;
    }
  }
  const lateralityMetrics = {
    Left: { count: lateralityCounts.Left, percentage: (lateralityCounts.Left / total) * 100 },
    Right: { count: lateralityCounts.Right, percentage: (lateralityCounts.Right / total) * 100 },
    Bilateral: { count: lateralityCounts.Bilateral, percentage: (lateralityCounts.Bilateral / total) * 100 },
    'Axial / N/A': { count: lateralityCounts['Axial / N/A'], percentage: (lateralityCounts['Axial / N/A'] / total) * 100 },
  };

  // Gender metrics
  const genderCounts: Record<Gender, number> = { Male: 0, Female: 0, Other: 0 };
  let ageSum = 0;
  let durationSum = 0;
  let durationCount = 0;
  let bloodLossSum = 0;
  let bloodLossCount = 0;

  for (const c of cases) {
    genderCounts[c.gender] = (genderCounts[c.gender] || 0) + 1;
    ageSum += c.age || 0;
    if (c.durationMinutes) {
      durationSum += c.durationMinutes;
      durationCount += 1;
    }
    if (c.estimatedBloodLossMl) {
      bloodLossSum += c.estimatedBloodLossMl;
      bloodLossCount += 1;
    }
  }

  const genderMetrics = {
    Male: { count: genderCounts.Male, percentage: (genderCounts.Male / total) * 100 },
    Female: { count: genderCounts.Female, percentage: (genderCounts.Female / total) * 100 },
    Other: { count: genderCounts.Other, percentage: (genderCounts.Other / total) * 100 },
  };

  // Complication types
  const compTypeMap = new Map<string, number>();
  for (const c of complicationCases) {
    const type = c.complicationDetails?.type || 'Unspecified';
    compTypeMap.set(type, (compTypeMap.get(type) || 0) + 1);
  }
  const complicationTypeCounts = Array.from(compTypeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: overallComplicationCount > 0 ? (count / overallComplicationCount) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Infection types
  const infTypeMap = new Map<string, number>();
  for (const c of infectionCases) {
    const type = c.infectionDetails?.type || 'Unspecified SSI';
    infTypeMap.set(type, (infTypeMap.get(type) || 0) + 1);
  }
  const infectionTypeCounts = Array.from(infTypeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: overallInfectionCount > 0 ? (count / overallInfectionCount) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Monthly trends
  const monthMap = new Map<string, { total: number; complications: number; infections: number }>();
  for (const c of cases) {
    const key = c.surgeryDate.slice(0, 7); // YYYY-MM
    const existing = monthMap.get(key) || { total: 0, complications: 0, infections: 0 };
    existing.total += 1;
    if (c.hasComplication) existing.complications += 1;
    if (c.hasInfection) existing.infections += 1;
    monthMap.set(key, existing);
  }

  const sortedMonthKeys = Array.from(monthMap.keys()).sort();
  const monthlyTrend = sortedMonthKeys.map((key) => {
    const val = monthMap.get(key)!;
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    return {
      monthKey: key,
      label,
      total: val.total,
      complications: val.complications,
      infections: val.infections,
    };
  });

  return {
    totalSurgeries: total,
    overallComplicationCount,
    overallComplicationRate,
    overallInfectionCount,
    overallInfectionRate,
    procedureMetrics,
    categoryMetrics,
    lateralityMetrics,
    genderMetrics,
    averageAge: Math.round(ageSum / total),
    averageDurationMinutes: durationCount > 0 ? Math.round(durationSum / durationCount) : 0,
    averageBloodLossMl: bloodLossCount > 0 ? Math.round(bloodLossSum / bloodLossCount) : 0,
    complicationTypeCounts,
    infectionTypeCounts,
    monthlyTrend,
  };
}

/**
 * Generates clinical audit period summary
 */
export function generatePeriodSummary(
  allCases: SurgicalCase[],
  options: {
    startDate?: string;
    endDate?: string;
    procedureFilter?: string;
    categoryFilter?: string;
  }
): PeriodSummaryReport {
  let filtered = [...allCases];

  if (options.startDate) {
    filtered = filtered.filter((c) => c.surgeryDate >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter((c) => c.surgeryDate <= options.endDate!);
  }
  if (options.procedureFilter && options.procedureFilter !== 'all') {
    filtered = filtered.filter((c) => c.procedureName === options.procedureFilter);
  }
  if (options.categoryFilter && options.categoryFilter !== 'all') {
    filtered = filtered.filter((c) => c.procedureCategory === options.categoryFilter);
  }

  const total = filtered.length;
  const complicationCases = filtered.filter((c) => c.hasComplication);
  const infectionCases = filtered.filter((c) => c.hasInfection);

  const genderCounts: Record<Gender, number> = { Male: 0, Female: 0, Other: 0 };
  const lateralityCounts: Record<Laterality, number> = {
    Left: 0,
    Right: 0,
    Bilateral: 0,
    'Axial / N/A': 0,
  };

  let ageSum = 0;
  for (const c of filtered) {
    genderCounts[c.gender] = (genderCounts[c.gender] || 0) + 1;
    if (c.laterality in lateralityCounts) {
      lateralityCounts[c.laterality] += 1;
    }
    ageSum += c.age || 0;
  }

  // Procedure breakdown
  const procCounts = new Map<string, number>();
  for (const c of filtered) {
    procCounts.set(c.procedureName, (procCounts.get(c.procedureName) || 0) + 1);
  }
  const procedureBreakdown = Array.from(procCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Category breakdown
  const catCounts = new Map<string, number>();
  for (const c of filtered) {
    catCounts.set(c.procedureCategory, (catCounts.get(c.procedureCategory) || 0) + 1);
  }
  const categoryBreakdown = Array.from(catCounts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    startDate: options.startDate || '',
    endDate: options.endDate || '',
    procedureFilter: options.procedureFilter || 'all',
    categoryFilter: options.categoryFilter || 'all',
    totalSurgeries: total,
    genderCounts,
    averageAge: total > 0 ? Math.round(ageSum / total) : 0,
    lateralityCounts,
    procedureBreakdown,
    categoryBreakdown,
    complicationsCount: complicationCases.length,
    complicationRate: total > 0 ? (complicationCases.length / total) * 100 : 0,
    infectionsCount: infectionCases.length,
    infectionRate: total > 0 ? (infectionCases.length / total) * 100 : 0,
    complicationCases,
    infectionCases,
    generatedAt: new Date().toISOString(),
  };
}
