"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TeamOption = string;

export function RegisterForm({
  locale,
  defaultRole,
  teams
}: {
  locale: string;
  defaultRole: "coach" | "athlete";
  teams: TeamOption[];
}) {
  const router = useRouter();
  const isHebrew = locale === "he";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"coach" | "athlete">(defaultRole);
  const [team, setTeam] = useState<TeamOption>(teams[0] ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9._-]{3,24}$/.test(username)) {
      setError(isHebrew ? "שם משתמש חייב להיות באנגלית בלבד" : "Username must use English letters/numbers only");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, username, password, role, team, locale })
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Registration failed");
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
      <h2>{isHebrew ? "הרשמה" : "Register"}</h2>

      <label>
        {isHebrew ? "תפקיד" : "Role"}
        <select value={role} onChange={(event) => setRole(event.target.value as "coach" | "athlete")}>
          <option value="coach">{isHebrew ? "מאמן" : "Coach"}</option>
          <option value="athlete">{isHebrew ? "שחקן" : "Player"}</option>
        </select>
      </label>

      <label>
        {isHebrew ? "קבוצה" : "Team"}
        <select value={team} onChange={(event) => setTeam(event.target.value)}>
          {teams.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label>
        {isHebrew ? "שם מלא" : "Full Name"}
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>

      <label>
        {isHebrew ? "אימייל" : "Email"}
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>

      <label>
        {isHebrew ? "שם משתמש (אנגלית בלבד)" : "Username (English only)"}
        <input value={username} onChange={(event) => setUsername(event.target.value)} required />
      </label>

      <label>
        {isHebrew ? "סיסמה" : "Password"}
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </label>

      {error ? <p className="error-text">{error}</p> : null}

      <button className="rect-button" type="submit" disabled={loading}>
        {isHebrew ? "יצירת חשבון" : "Create account"}
      </button>
    </form>
  );
}
