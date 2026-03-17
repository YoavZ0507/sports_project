import Link from "next/link";
import { DemoAccessPanel } from "@/components/demo-access-panel";

export default async function LocaleHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isHebrew = locale === "he";

  return (
    <section className="landing">
      <div className="card">
        <h2>{isHebrew ? "ברוכים הבאים" : "Welcome"}</h2>
        <p>
          {isHebrew
            ? "לפני שמתחילים, בחרו אם אתם מאמן או שחקן והמשיכו להתחברות."
            : "Before you start, choose whether you are a coach or a player and continue to sign-in."}
        </p>
      </div>

      <DemoAccessPanel locale={locale} />

      <div className="role-grid">
        <Link className="role-card role-card-coach" href={`/${locale}/auth?role=coach`}>
          <h3>{isHebrew ? "מאמן" : "Coach"}</h3>
          <p>{isHebrew ? "ניהול קבוצה, משימות ונתונים מתקדמים." : "Manage team, tasks, and advanced insights."}</p>
        </Link>

        <Link className="role-card role-card-athlete" href={`/${locale}/auth?role=athlete`}>
          <h3>{isHebrew ? "שחקן" : "Player"}</h3>
          <p>{isHebrew ? "לוח אישי, משימות קרובות ומדדי התקדמות." : "Personal board, upcoming tasks, and progress metrics."}</p>
        </Link>
      </div>

      <Link className="panel-link-card" href={`/${locale}/register`}>
        <h3>{isHebrew ? "הרשמה למערכת" : "Register to the Platform"}</h3>
        <p>
          {isHebrew
            ? "יצירת משתמש חדש, בחירת קבוצה ושמירה מאובטחת של פרטי התחברות."
            : "Create a new user, choose a team, and store credentials securely."}
        </p>
      </Link>

    </section>
  );
}
