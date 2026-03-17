import Link from "next/link";

export function DemoAccessPanel({ locale }: { locale: string }) {
  const isHebrew = locale === "he";

  return (
    <section className="card">
      <h2>{isHebrew ? "כניסה מיידית לבדיקה" : "Instant Test Access"}</h2>
      <p>
        {isHebrew
          ? "כניסה ישירה למערכת בלי למלא סיסמה, כדי לעבור על חוויית המשתמש."
          : "Enter the system directly without a password to review the user experience."}
      </p>

      <div className="role-grid">
        <Link className="role-card role-card-coach" href={`/api/auth/demo-login?role=coach&locale=${locale}`}>
          <h3>{isHebrew ? "בדיקה כמאמן" : "Test as Coach"}</h3>
          <p>{isHebrew ? "כניסה ישירה ללוח הקבוצה." : "Open the team dashboard directly."}</p>
        </Link>

        <Link className="role-card role-card-athlete" href={`/api/auth/demo-login?role=athlete&locale=${locale}`}>
          <h3>{isHebrew ? "בדיקה כשחקן" : "Test as Athlete"}</h3>
          <p>{isHebrew ? "כניסה ישירה ללוח השחקן." : "Open the athlete dashboard directly."}</p>
        </Link>
      </div>
    </section>
  );
}
