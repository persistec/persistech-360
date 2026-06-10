'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/departments', label: 'Departments' },
    { href: '/hierarchy-levels', label: 'Hierarchy Levels' },
    { href: '/roles', label: 'Roles' },
    { href: '/users', label: 'Users' },
    { href: '/cycles', label: 'Evaluation Cycles' },
    { href: '/assignments', label: 'Assignments' },
    { href: '/submissions', label: 'Submissions' },
    { href: '/results', label: 'Results' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold tracking-tight">Persistech 360</span>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        MVP Admin Interface
      </div>
    </aside>
  );
}
