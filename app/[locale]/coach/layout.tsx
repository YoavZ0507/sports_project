import Link from "next/link";

export default async function CoachLayout({
  params,
  children
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  const isHebrew = locale === "he";

  return (
    <section>
      <nav className="rect-nav">
        <Link className="rect-nav-link" href={`/${locale}/coach/dashboard`}>
          {isHebrew ? "לוח קבוצה" : "Team Board"}
        </Link>
        <Link className="rect-nav-link" href={`/${locale}/coach/tasks`}>
          {isHebrew ? "ניהול משימות" : "Task Management"}
        </Link>
        <Link className="rect-nav-link" href={`/${locale}/coach/team-insights`}>
          {isHebrew ? "נתונים מתקדמים" : "Advanced Insights"}
        </Link>
      </nav>
      {children}
    </section>
  );
}
