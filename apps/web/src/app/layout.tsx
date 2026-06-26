import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { OperationalShellHeader } from "@/components/OperationalShellHeader";

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
    <html lang="pt-AO" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('persistech-360-theme-mode');
                  var mode = 'system';
                  if (stored) {
                    var lower = stored.toLowerCase();
                    if (lower === 'claro' || lower === 'light') mode = 'light';
                    else if (lower === 'escuro' || lower === 'dark') mode = 'dark';
                  }
                  
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
          <div className="flex h-dvh min-h-0 flex-col overflow-hidden xl:flex-row">
            <Sidebar />
            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
              <OperationalShellHeader />
              <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}