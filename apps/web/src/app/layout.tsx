import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Persistech 360 - MVP de Administração",
  description: "MVP de Administração Interna para Persistech 360",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('persistech-360-theme-mode');
                  var mode = stored || 'system';
                  var resolved = mode;
                  if (mode === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.dataset.theme = resolved;
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <div className="flex h-dvh overflow-hidden flex-col md:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">
              <div className="mx-auto w-full max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
