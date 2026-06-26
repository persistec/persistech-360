'use client';

import { usePathname } from 'next/navigation';
import { FiArrowRight, FiCalendar, FiGrid } from 'react-icons/fi';
import { StatusBadge } from '@/components/ui';
import { getShellContext, shellCycleSummary } from '@/lib/shell';

export function OperationalShellHeader() {
  const pathname = usePathname();
  const context = getShellContext(pathname);

  return (
    <header className="xl:sticky xl:top-0 xl:z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-5 py-4 sm:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <FiGrid className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Portal operacional</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{context.title}</h1>
              <StatusBadge tone="info">{context.group}</StatusBadge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground hidden sm:block">{context.description}</p>
          </div>

          <div className="hidden xl:grid xl:w-[34rem] grid-cols-2 gap-3">
            <div className="min-w-0 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm shadow-black/5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <FiCalendar className="h-4 w-4 text-primary" aria-hidden="true" />
                {shellCycleSummary.label}
              </div>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{shellCycleSummary.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{shellCycleSummary.description}</p>
                </div>
                <StatusBadge tone="success">{shellCycleSummary.badge}</StatusBadge>
              </div>
            </div>

            <div className="min-w-0 rounded-xl border border-border bg-surface-elevated px-4 py-3 shadow-sm shadow-black/5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <FiArrowRight className="h-4 w-4 text-primary" aria-hidden="true" />
                Referência do shell
              </div>
              <p className="mt-2 text-sm font-medium text-foreground">Estrutura corporativa e operacional</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Layout de administração agrupada e foco visual consistente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}