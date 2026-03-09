import Link from "next/link";
import { getDictionary, getDirection } from "@/lib/i18n/dictionaries";

export default async function LocaleLayout({
  params,
  children
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;
  const t = getDictionary(locale);
  const dir = getDirection(locale);

  return (
    <main dir={dir} data-locale={locale}>
      <header className="top-shell">
        <div className="brand-rect">
          <h1>{t.appTitle}</h1>
        </div>

        <div className="lang-switch" aria-label={locale === "he" ? "בחירת שפה" : "Language selection"}>
          <Link className={`lang-link ${locale === "he" ? "lang-link-active" : ""}`} href="/he">
            עברית
          </Link>
          <Link className={`lang-link ${locale === "en" ? "lang-link-active" : ""}`} href="/en">
            English
          </Link>
        </div>
      </header>

      {children}
    </main>
  );
}
