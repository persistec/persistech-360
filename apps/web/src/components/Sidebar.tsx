'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Sidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'Visão Geral',
      items: [{ href: '/', label: 'Painel' }],
    },
    {
      title: 'Organização',
      items: [
        { href: '/departments', label: 'Departamentos' },
        { href: '/hierarchy-levels', label: 'Níveis Hierárquicos' },
        { href: '/roles', label: 'Funções' },
        { href: '/users', label: 'Utilizadores' },
      ],
    },
    {
      title: 'Avaliações',
      items: [
        { href: '/cycles', label: 'Ciclos de Avaliação' },
        { href: '/assignments', label: 'Atribuições' },
        { href: '/submissions', label: 'Submissões' },
        { href: '/results', label: 'Resultados' },
      ],
    },
  ];

  return (
    <>
    <div className="border-b border-border bg-surface/95 p-4 md:hidden">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
        <div>
          <span className="block text-base font-semibold text-foreground">Persistech 360</span>
          <span className="text-xs uppercase tracking-wide text-primary/80">Controlo de Administração</span>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {navSections.flatMap((section) => section.items).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-md border px-3 py-2 text-xs font-medium ${
                isActive
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border bg-surface-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-3">
        <ThemeSwitcher />
      </div>
    </div>
    <aside className="hidden h-dvh w-72 shrink-0 flex-col border-r border-border bg-surface/90 text-foreground shadow-2xl shadow-black/10 backdrop-blur md:flex">
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 shadow-[0_0_28px_var(--color-primary)]">
            <span className="h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_var(--color-primary)]" />
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-foreground">Persistech 360</span>
            <span className="text-xs font-medium uppercase tracking-wide text-primary/80">Controlo de Administração</span>
          </div>
        </div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto space-y-7 px-4 py-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`group relative flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-primary/15 text-primary shadow-[inset_3px_0_0_var(--color-primary)]'
                          : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                      }`}
                    >
                      <span className={`mr-3 h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary shadow-[0_0_14px_var(--color-primary)]' : 'bg-muted-foreground group-hover:bg-primary/70'}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="shrink-0 border-t border-border p-5 space-y-4">
        <ThemeSwitcher />
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>MVP</span>
            <span className="text-success">Online</span>
          </div>
          <p className="mt-2 text-sm text-foreground/80">Interface interna de administração</p>
        </div>
      </div>
    </aside>
    </>
  );
}
