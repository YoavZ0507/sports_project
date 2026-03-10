import { requireRole } from "@/lib/auth";
import { AthleteTopNav } from "@/components/athlete-top-nav";

export default async function AthleteLayout({
  params,
  children
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  await requireRole(locale, "athlete");
  return (
    <section>
      <AthleteTopNav locale={locale} />
      {children}
    </section>
  );
}
