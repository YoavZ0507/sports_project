import { redirect } from "next/navigation";

export default async function AthleteTasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/athlete/dashboard`);
}
