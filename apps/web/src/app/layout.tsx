import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Persistech 360 - Admin MVP",
  description: "Internal Admin MVP for Persistech 360",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
