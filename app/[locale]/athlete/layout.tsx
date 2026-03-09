import { requireRole } from "@/lib/auth";

export default async function AthleteLayout({
  params,
  children
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  await requireRole(locale, "athlete");
  return <section>{children}</section>;
}
