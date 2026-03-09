import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athlete Task Hub",
  description: "Coach-athlete task management MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
