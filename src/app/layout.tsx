import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مدير كرة القدم - Football Manager",
  description: "لعبة مدير كرة القدم الإلكترونية - أنشئ فريقك وقودهم نحو المجد!",
  icons: {
    icon: "⚽",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-slate-900 text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
