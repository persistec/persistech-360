'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'Overview',
      items: [{ href: '/', label: 'Dashboard' }],
    },
    {
      title: 'Organization',
      items: [
        { href: '/departments', label: 'Departments' },
        { href: '/hierarchy-levels', label: 'Hierarchy Levels' },
        { href: '/roles', label: 'Roles' },
        { href: '/users', label: 'Users' },
      ],
    },
    {
      title: 'Evaluations',
      items: [
        { href: '/cycles', label: 'Evaluation Cycles' },
        { href: '/assignments', label: 'Assignments' },
        { href: '/submissions', label: 'Submissions' },
        { href: '/results', label: 'Results' },
      ],
    },
  ];

  return (
    <>
    <div className="border-b border-cyan-400/10 bg-slate-950/95 p-4 md:hidden">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
        </div>
        <div>
          <span className="block text-base font-semibold text-slate-50">Persistech 360</span>
          <span className="text-xs uppercase tracking-wide text-cyan-200/80">Admin Control</span>
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
                  ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-100'
                  : 'border-slate-700 bg-slate-900/80 text-slate-300'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
    <aside className="hidden min-h-screen w-72 flex-shrink-0 flex-col border-r border-cyan-400/10 bg-slate-950/88 text-white shadow-2xl shadow-black/30 backdrop-blur md:flex">
      <div className="border-b border-slate-800/90 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
            <span className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-slate-50">Persistech 360</span>
            <span className="text-xs font-medium uppercase tracking-wide text-cyan-200/80">Admin Control</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-7 px-4 py-6">
        {navSections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                          ? 'bg-cyan-400/12 text-cyan-100 shadow-[inset_3px_0_0_rgba(34,211,238,0.95)]'
                          : 'text-slate-400 hover:bg-slate-800/75 hover:text-slate-100'
                      }`}
                    >
                      <span className={`mr-3 h-1.5 w-1.5 rounded-full ${isActive ? 'bg-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.9)]' : 'bg-slate-600 group-hover:bg-cyan-300/70'}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-800/90 p-5">
        <div className="rounded-lg border border-cyan-400/15 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500">
            <span>MVP</span>
            <span className="text-emerald-300">Online</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">Internal admin interface</p>
        </div>
      </div>
    </aside>
    </>
  );
}
