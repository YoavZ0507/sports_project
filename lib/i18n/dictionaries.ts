import type { Locale } from "@/lib/types";

export const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    appTitle: "Athlete Task Hub",
    coachDashboard: "Coach Dashboard",
    athletes: "Athletes",
    tasks: "Tasks",
    progress: "Progress",
    teamInsights: "Team Insights",
    myTasks: "My Tasks",
    feedback: "Feedback Timeline",
    completionRate: "Completion Rate",
    overdue: "Overdue",
    recentActivity: "Recent Activity"
  },
  he: {
    appTitle: "מרכז משימות לספורטאים",
    coachDashboard: "לוח מאמן",
    athletes: "ספורטאים",
    tasks: "משימות",
    progress: "התקדמות",
    teamInsights: "תובנות קבוצה",
    myTasks: "המשימות שלי",
    feedback: "ציר משוב",
    completionRate: "שיעור השלמה",
    overdue: "באיחור",
    recentActivity: "פעילות אחרונה"
  }
};

export function getDictionary(locale: string): Record<string, string> {
  return dictionaries[(locale as Locale) ?? "en"] ?? dictionaries.en;
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}
