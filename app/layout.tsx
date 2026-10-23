import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DaySync — Shared Productivity, Study & Wellness for Two',
  description: 'Two-person accountability, shared schedules, study tracking, fitness, and sleep coaching.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/output.css" />
      </head>
      <body className="bg-[#FAF8F5] text-slate-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
