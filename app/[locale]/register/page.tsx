import { RegisterForm } from "@/components/register-form";
import { TEAMS } from "@/lib/teams";

export default async function RegisterPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  const { role } = await searchParams;
  const defaultRole: "coach" | "athlete" = role === "athlete" ? "athlete" : "coach";
  const isHebrew = locale === "he";

  return (
    <section className="landing">
      <div className="card">
        <h2>{isHebrew ? "פתיחת חשבון חדש" : "Create a New Account"}</h2>
        <p>
          {isHebrew
            ? "כל פרטי ההתחברות נשמרים בצורה מאובטחת. שם המשתמש חייב להיות באנגלית."
            : "Credentials are stored securely. Username must be English only."}
        </p>
      </div>

      <RegisterForm locale={locale} defaultRole={defaultRole} teams={[...TEAMS]} />
    </section>
  );
}
