"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function RoleLoginForm({ locale, role }: { locale: string; role: "coach" | "athlete" }) {
  const router = useRouter();
  const isHebrew = locale === "he";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerHref = useMemo(() => `/${locale}/register?role=${role}`, [locale, role]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, locale })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Login failed");
        return;
      }

      router.push(payload.data.nextPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function runSystemTestLogin() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, locale })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Demo login failed");
        return;
      }

      router.push(payload.data.nextPath);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card auth-form" onSubmit={onSubmit}>
      <h2>{isHebrew ? "כניסה למערכת" : "Sign In"}</h2>
      <p>{isHebrew ? `התחברות כ-${role === "coach" ? "מאמן" : "שחקן"}` : `Signing in as ${role}`}</p>

      <label>
        {isHebrew ? "אימייל" : "Email"}
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="name@example.com" required />
      </label>

      <label>
        {isHebrew ? "סיסמה" : "Password"}
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder={isHebrew ? "לפחות 8 תווים" : "At least 8 characters"}
          required
        />
      </label>

      {error ? <p className="error-text">{error}</p> : null}

      <button className="rect-button" type="submit" disabled={loading}>
        {isHebrew ? "התחברות" : "Sign In"}
      </button>

      <button className="rect-button rect-button-secondary" type="button" onClick={runSystemTestLogin} disabled={loading}>
        {isHebrew ? "כניסה לבדיקת מערכת" : "System Test Login"}
      </button>

      <Link className="panel-link-card" href={registerHref}>
        <h3>{isHebrew ? "אין חשבון? הרשמה" : "No account? Register"}</h3>
        <p>
          {isHebrew
            ? "יצירת חשבון חדש עם בחירת קבוצה ופרטים אישיים."
            : "Create a new account with team selection and personal details."}
        </p>
      </Link>
    </form>
  );
}
