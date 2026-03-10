"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AthleteTopNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isHebrew = locale === "he";

  const links = [
    {
      href: `/${locale}/athlete/dashboard`,
      label: isHebrew ? "לוח שחקן" : "Player Board"
    },
    {
      href: `/${locale}/athlete/team-metrics`,
      label: isHebrew ? "מדדי קבוצה" : "Team Metrics"
    },
    {
      href: `/${locale}/athlete/calendar`,
      label: isHebrew ? "לוח שנה" : "Calendar"
    }
  ];

  return (
    <nav className="rect-nav" aria-label={isHebrew ? "ניווט שחקן" : "Athlete navigation"}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} className={`rect-nav-link ${isActive ? "rect-nav-link-active" : ""}`} href={link.href}>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
