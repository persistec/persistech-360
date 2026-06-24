'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiGrid, 
  FiFolder, 
  FiLayers, 
  FiBriefcase, 
  FiUsers, 
  FiCalendar, 
  FiClipboard, 
  FiCheckSquare, 
  FiTrendingUp, 
  FiSettings,
  FiBox 
} from 'react-icons/fi';

export function Sidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'Visão Geral',
      items: [{ href: '/', label: 'Painel', icon: FiGrid }],
    },
    {
      title: 'Organização',
      items: [
        { href: '/departments', label: 'Departamentos', icon: FiFolder },
        { href: '/hierarchy-levels', label: 'Níveis Hierárquicos', icon: FiLayers },
        { href: '/roles', label: 'Funções', icon: FiBriefcase },
        { href: '/users', label: 'Utilizadores', icon: FiUsers },
      ],
    },
    {
      title: 'Avaliações',
      items: [
        { href: '/cycles', label: 'Ciclos de Avaliação', icon: FiCalendar },
        { href: '/assignments', label: 'Atribuições', icon: FiClipboard },
        { href: '/submissions', label: 'Submissões', icon: FiCheckSquare },
        { href: '/results', label: 'Resultados', icon: FiTrendingUp },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { href: '/settings', label: 'Definições', icon: FiSettings },
      ],
    },
  ];

  return (
    <>
    <div className="border-b border-border bg-surface/95 p-4 md:hidden">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <FiBox className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <span className="block text-base font-semibold text-foreground">Persistech 360</span>
          <span className="text-xs uppercase tracking-wide text-primary/80">Controlo de Administração</span>
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {navSections.flatMap((section) => section.items).map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${
                isActive
                  ? 'border-primary/50 bg-primary/15 text-primary'
                  : 'border-border bg-surface-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
    <aside className="hidden h-dvh w-72 shrink-0 flex-col border-r border-border bg-surface/90 text-foreground shadow-2xl shadow-black/10 backdrop-blur md:flex">
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 shadow-[0_0_28px_var(--color-primary)]">
            <FiBox className="h-5 w-5 text-primary drop-shadow-[0_0_8px_var(--color-primary)]" aria-hidden="true" />
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
                const Icon = item.icon;
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
                      <Icon 
                        className={`mr-3 h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-primary drop-shadow-[0_0_8px_var(--color-primary)]' : 'text-muted-foreground group-hover:text-primary/80'
                        }`} 
                        aria-hidden="true" 
                      />
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