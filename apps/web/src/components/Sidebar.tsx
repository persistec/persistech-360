'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiClock, FiInfo } from 'react-icons/fi';
import { StatusBadge } from '@/components/ui';
import { getShellContext, shellBrand, shellCycleSummary, shellSections } from '@/lib/shell';

export function Sidebar() {
  const pathname = usePathname();
  const context = getShellContext(pathname);
  const BrandIcon = shellBrand.icon;

  return (
    <>
      <div className="border-b border-border bg-surface/95 p-4 xl:hidden">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <span className="block text-base font-semibold text-foreground">{shellBrand.title}</span>
            <span className="text-xs uppercase tracking-wide text-primary/80">{shellBrand.subtitle}</span>
          </div>
          <StatusBadge tone="success">Operacional</StatusBadge>
        </div>
        <div className="mb-3 rounded-xl border border-border bg-surface-muted p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <FiClock className="h-4 w-4 text-primary" aria-hidden="true" />
            {shellCycleSummary.label}
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{shellCycleSummary.title}</p>
          <p className="mt-1 text-xs leading-5 text-foreground/80">{context.group}</p>
        </div>
        <nav className="flex min-w-0 gap-2 overflow-x-auto pb-1">
          {shellSections.flatMap((section) => section.items).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? 'border-primary/50 bg-primary/15 text-primary shadow-[inset_0_0_0_1px_var(--color-primary)]'
                    : 'border-border bg-surface-muted text-muted-foreground hover:border-border-strong hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <aside className="hidden min-h-0 h-dvh w-[20rem] shrink-0 flex-col border-r border-border bg-surface/90 text-foreground shadow-2xl shadow-black/10 backdrop-blur xl:flex">
        <div className="border-b border-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 shadow-[0_0_28px_var(--color-primary)]">
              <BrandIcon className="h-5 w-5 text-primary drop-shadow-[0_0_8px_var(--color-primary)]" aria-hidden="true" />
            </div>
            <div>
              <span className="block text-lg font-semibold tracking-tight text-foreground">{shellBrand.title}</span>
              <span className="text-xs font-medium uppercase tracking-wide text-primary/80">{shellBrand.subtitle}</span>
            </div>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {shellSections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-border bg-surface px-3 py-3 shadow-sm shadow-black/5">
              <div className="flex items-start justify-between gap-3 px-1 pb-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                          isActive
                            ? 'bg-primary/15 text-primary shadow-[inset_3px_0_0_var(--color-primary)]'
                            : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-primary drop-shadow-[0_0_8px_var(--color-primary)]' : 'text-muted-foreground group-hover:text-primary/80'
                          }`}
                          aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                          <span>{item.label}</span>
                          {isActive ? <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" /> : null}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </nav>
        <div className="shrink-0 border-t border-border p-5">
          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <FiInfo className="h-4 w-4 text-primary" aria-hidden="true" />
              Contexto operacional
            </div>
            <p className="mt-2 text-sm text-foreground">{shellCycleSummary.title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{shellCycleSummary.description}</p>
          </div>
        </div>
      </aside>
    </>
  );
}