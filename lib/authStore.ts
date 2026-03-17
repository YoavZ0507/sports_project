import { createId } from "@/lib/ids";
import { repository } from "@/lib/repositories/inMemoryRepository";
import { TEAMS, type TeamName } from "@/lib/teams";
import { createSessionToken, hashPassword, verifyPassword, isEnglishUsername } from "@/lib/security";
import { syncWorkspaceMemberToBackbone } from "@/lib/services/backboneSyncService";
import type { Locale, MembershipRole } from "@/lib/types";
import { createWorkspace, requestToJoinWorkspace } from "@/lib/services/workspaceService";

export interface Account {
  userId: string;
  fullName: string;
  email: string;
  username: string;
  passwordHash: string;
  calendarToken: string;
  role: Exclude<MembershipRole, "pending">;
  team: TeamName;
  locale: Locale;
}

export interface SessionData {
  token: string;
  userId: string;
  role: "coach" | "athlete";
  locale: Locale;
}

const accountsByEmail = new Map<string, Account>();
const accountsByUsername = new Map<string, Account>();
const sessions = new Map<string, SessionData>();

function getWorkspaceByTeam(team: TeamName) {
  return repository.listWorkspaces().find((workspace) => workspace.name === team);
}

function assertTeam(team: string): TeamName {
  if (!TEAMS.includes(team as TeamName)) {
    throw new Error("invalid team selection");
  }
  return team as TeamName;
}

function ensureDemoAccounts(): void {
  if (accountsByEmail.size > 0) return;

  const demoCoach: Account = {
    userId: "coach_demo",
    fullName: "Demo Coach",
    email: "coach.demo@system.local",
    username: "coach_demo",
    passwordHash: hashPassword("DemoPass123!"),
    calendarToken: createSessionToken(),
    role: "coach",
    team: "Maccabi Tel Aviv",
    locale: "he"
  };

  const demoAthlete: Account = {
    userId: "athlete_demo",
    fullName: "Noa Levi",
    email: "athlete.demo@system.local",
    username: "athlete_demo",
    passwordHash: hashPassword("DemoPass123!"),
    calendarToken: createSessionToken(),
    role: "athlete",
    team: "Maccabi Tel Aviv",
    locale: "he"
  };

  [demoCoach, demoAthlete].forEach((account) => {
    accountsByEmail.set(account.email.toLowerCase(), account);
    accountsByUsername.set(account.username.toLowerCase(), account);
    repository.upsertUser({
      id: account.userId,
      email: account.email,
      fullName: account.fullName,
      locale: account.locale
    });
  });
}

export function createAccount(input: {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: "coach" | "athlete";
  team: string;
  locale: Locale;
}): Account {
  ensureDemoAccounts();

  const email = input.email.trim().toLowerCase();
  const username = input.username.trim();

  if (!isEnglishUsername(username)) {
    throw new Error("username must be in English letters/numbers only");
  }

  if (input.password.length < 8) {
    throw new Error("password must be at least 8 characters");
  }

  if (accountsByEmail.has(email)) {
    throw new Error("email already exists");
  }

  if (accountsByUsername.has(username.toLowerCase())) {
    throw new Error("username already exists");
  }

  const account: Account = {
    userId: createId("user"),
    fullName: input.fullName.trim(),
    email,
    username,
    passwordHash: hashPassword(input.password),
    calendarToken: createSessionToken(),
    role: input.role,
    team: assertTeam(input.team),
    locale: input.locale
  };

  accountsByEmail.set(email, account);
  accountsByUsername.set(username.toLowerCase(), account);

  repository.upsertUser({
    id: account.userId,
    email: account.email,
    fullName: account.fullName,
    locale: account.locale
  });

  if (account.role === "coach") {
    const existingTeamWorkspace = getWorkspaceByTeam(account.team);
    if (!existingTeamWorkspace) {
      createWorkspace({
        coachId: account.userId,
        coachRole: "coach",
        name: account.team
      });
    } else {
      const existingMembership = repository.getWorkspaceMembership(existingTeamWorkspace.id, account.userId);
      if (!existingMembership) {
        const createdMembership = repository.createWorkspaceMember({
          id: createId("member"),
          workspaceId: existingTeamWorkspace.id,
          userId: account.userId,
          role: "coach",
          createdAt: new Date().toISOString()
        });
        syncWorkspaceMemberToBackbone(createdMembership);
      } else if (existingMembership.role !== "coach") {
        const updatedMembership = repository.updateWorkspaceMemberRole(existingMembership.id, "coach");
        if (updatedMembership) {
          syncWorkspaceMemberToBackbone(updatedMembership);
        }
      }
    }
  } else {
    const workspace = getWorkspaceByTeam(account.team);
    if (workspace) {
      requestToJoinWorkspace({
        workspaceId: workspace.id,
        athleteId: account.userId
      });
    }
  }

  return account;
}

export function createSessionForAccount(account: Account): SessionData {
  const token = createSessionToken();
  const session: SessionData = {
    token,
    userId: account.userId,
    role: account.role,
    locale: account.locale
  };

  sessions.set(token, session);
  return session;
}

export function createSessionByCredentials(input: { email: string; password: string }): SessionData {
  ensureDemoAccounts();

  const account = accountsByEmail.get(input.email.trim().toLowerCase());
  if (!account) {
    throw new Error("invalid credentials");
  }

  if (!verifyPassword(input.password, account.passwordHash)) {
    throw new Error("invalid credentials");
  }

  return createSessionForAccount(account);
}

export function createSystemTestSession(role: "coach" | "athlete", locale: Locale): SessionData {
  ensureDemoAccounts();
  const account = role === "coach"
    ? accountsByUsername.get("coach_demo")
    : accountsByUsername.get("athlete_demo");

  if (!account) {
    throw new Error("demo account unavailable");
  }

  const session = createSessionForAccount(account);
  session.locale = locale;
  sessions.set(session.token, session);
  return session;
}

export function getSession(token: string): SessionData | undefined {
  return sessions.get(token);
}

export function clearSession(token: string): void {
  sessions.delete(token);
}

export function getAccountByUserId(userId: string): Account | undefined {
  ensureDemoAccounts();
  return [...accountsByEmail.values()].find((account) => account.userId === userId);
}

export function getAccountByCalendarToken(calendarToken: string): Account | undefined {
  ensureDemoAccounts();
  return [...accountsByEmail.values()].find((account) => account.calendarToken === calendarToken);
}

export function getCalendarTokenByUserId(userId: string): string | undefined {
  return getAccountByUserId(userId)?.calendarToken;
}
