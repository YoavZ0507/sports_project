import Link from "next/link";
import { RoleLoginForm } from "@/components/role-login-form";

export default async function AuthPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { locale } = await params;
  const { role } = await searchParams;
  const isHebrew = locale === "he";
  const selectedRole: "coach" | "athlete" = role === "athlete" ? "athlete" : "coach";

  return (
    <section className="landing">
      <div className="role-grid">
        <Link className={`role-card ${selectedRole === "coach" ? "role-card-active" : ""}`} href={`/${locale}/auth?role=coach`}>
          <h3>{isHebrew ? "מאמן" : "Coach"}</h3>
        </Link>
        <Link className={`role-card ${selectedRole === "athlete" ? "role-card-active" : ""}`} href={`/${locale}/auth?role=athlete`}>
          <h3>{isHebrew ? "שחקן" : "Player"}</h3>
        </Link>
      </div>

      <RoleLoginForm locale={locale} role={selectedRole} />
    </section>
  );
}
