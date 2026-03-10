import { repository } from "@/lib/repositories/inMemoryRepository";

export interface MetricAthleteScore {
  athleteId: string;
  athleteName: string;
  average: number;
  values: number[];
  unit?: string;
}

export interface MetricSummary {
  key: string;
  teamAverage: number;
  scores: MetricAthleteScore[];
  topThree: MetricAthleteScore[];
  bottomThree: MetricAthleteScore[];
  unit?: string;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export function getMetricSummaries(workspaceId: string): MetricSummary[] {
  const athletes = repository.listWorkspaceMembers(workspaceId).filter((member) => member.role === "athlete");
  const metricByKey = new Map<string, Map<string, { name: string; values: number[]; unit?: string }>>();

  for (const athlete of athletes) {
    const user = repository.getUser(athlete.userId);
    const assignments = repository.listAssignmentsForAthlete(workspaceId, athlete.userId);

    for (const { assignment } of assignments) {
      const updates = repository.listProgressForAssignment(assignment.id);
      for (const update of updates) {
        for (const metric of update.metrics) {
          const keyMap = metricByKey.get(metric.metricKey) ?? new Map<string, { name: string; values: number[]; unit?: string }>();
          const athleteMetric = keyMap.get(athlete.userId) ?? {
            name: user?.fullName ?? athlete.userId,
            values: [],
            unit: metric.unit
          };

          athleteMetric.values.push(metric.metricValue);
          athleteMetric.unit = athleteMetric.unit ?? metric.unit;
          keyMap.set(athlete.userId, athleteMetric);
          metricByKey.set(metric.metricKey, keyMap);
        }
      }
    }
  }

  return [...metricByKey.entries()].map(([key, perAthlete]) => {
    const scores: MetricAthleteScore[] = [...perAthlete.entries()].map(([athleteId, payload]) => ({
      athleteId,
      athleteName: payload.name,
      average: average(payload.values),
      values: payload.values,
      unit: payload.unit
    }));

    const sortedDesc = [...scores].sort((a, b) => b.average - a.average);
    const sortedAsc = [...scores].sort((a, b) => a.average - b.average);

    return {
      key,
      teamAverage: average(scores.map((item) => item.average)),
      scores,
      topThree: sortedDesc.slice(0, 3),
      bottomThree: sortedAsc.slice(0, 3),
      unit: scores.find((item) => item.unit)?.unit
    };
  });
}
