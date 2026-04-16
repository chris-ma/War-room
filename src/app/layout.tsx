import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "War Room — Global Conflict Dashboard",
  description: "Real-time world map of global conflict events and breaking news.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
