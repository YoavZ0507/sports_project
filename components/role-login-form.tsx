"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export function RoleLoginForm({ locale, role }: { locale: string; role: "coach" | "athlete" }) {
  const router = useRouter();
  const isHebrew = locale === "he";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const destination = useMemo(() => {
    return role === "coach" ? `/${locale}/coach/dashboard` : `/${locale}/athlete/dashboard`;
  }, [locale, role]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fullName || !email || !password) return;

    document.cookie = `role=${role}; path=/`;
    document.cookie = `user_name=${encodeURIComponent(fullName)}; path=/`;
    router.push(destination);
  }

  return (
    <form className="card auth-form" onSubmit={onSubmit}>
      <h2>{isHebrew ? "כניסה למערכת" : "Sign In"}</h2>
      <p>{isHebrew ? `התחברות כ-${role === "coach" ? "מאמן" : "שחקן"}` : `Signing in as ${role}`}</p>

      <label>
        {isHebrew ? "שם מלא" : "Full name"}
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={isHebrew ? "הכניסו שם" : "Enter name"} />
      </label>

      <label>
        {isHebrew ? "אימייל" : "Email"}
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder={isHebrew ? "name@example.com" : "name@example.com"}
        />
      </label>

      <label>
        {isHebrew ? "סיסמה" : "Password"}
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder={isHebrew ? "לפחות 8 תווים" : "At least 8 characters"}
        />
      </label>

      <button className="rect-button" type="submit">
        {isHebrew ? "התחברות" : "Sign In"}
      </button>
    </form>
  );
}
