import type { ElementType } from 'react';
import {
  FiBox,
  FiBriefcase,
  FiCalendar,
  FiCheckSquare,
  FiClipboard,
  FiFolder,
  FiGrid,
  FiLayers,
  FiSettings,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

export type ShellNavItem = {
  href: string;
  label: string;
  icon: ElementType;
};

export type ShellSection = {
  title: string;
  description: string;
  items: ShellNavItem[];
};

export const shellSections: ShellSection[] = [
  {
    title: 'VisÃƒÂ£o Geral',
    description: 'Atalhos e contexto operacional.',
    items: [{ href: '/', label: 'Painel', icon: FiGrid }],
  },
  {
    title: 'OrganizaÃƒÂ§ÃƒÂ£o',
    description: 'Estrutura de base da avaliaÃƒÂ§ÃƒÂ£o.',
    items: [
      { href: '/departments', label: 'Departamentos', icon: FiFolder },
      { href: '/hierarchy-levels', label: 'NÃƒÂ­veis HierÃƒÂ¡rquicos', icon: FiLayers },
      { href: '/roles', label: 'FunÃƒÂ§ÃƒÂµes', icon: FiBriefcase },
      { href: '/users', label: 'Utilizadores', icon: FiUsers },
    ],
  },
  {
    title: 'AvaliaÃƒÂ§ÃƒÂµes',
    description: 'Ciclos, atribuiÃƒÂ§ÃƒÂµes e submissÃƒÂµes.',
    items: [
      { href: '/cycles', label: 'Ciclos de AvaliaÃƒÂ§ÃƒÂ£o', icon: FiCalendar },
      { href: '/assignments', label: 'AtribuiÃƒÂ§ÃƒÂµes', icon: FiClipboard },
      { href: '/submissions', label: 'SubmissÃƒÂµes', icon: FiCheckSquare },
      { href: '/results', label: 'Resultados', icon: FiTrendingUp },
    ],
  },
  {
    title: 'Sistema',
    description: 'PreferÃƒÂªncias e configuraÃƒÂ§ÃƒÂµes da interface.',
    items: [{ href: '/settings', label: 'DefiniÃƒÂ§ÃƒÂµes', icon: FiSettings }],
  },
];

type ShellRouteContext = {
  title: string;
  group: string;
  description: string;
};

const routeContexts: Record<string, ShellRouteContext> = {
  '/': {
    title: 'Painel',
    group: 'VisÃƒÂ£o Geral',
    description: 'Resumo operacional e atalhos da administraÃƒÂ§ÃƒÂ£o interna.',
  },
  '/departments': {
    title: 'Departamentos',
    group: 'OrganizaÃƒÂ§ÃƒÂ£o',
    description: 'Estrutura hierÃƒÂ¡rquica de base usada por utilizadores, funÃƒÂ§ÃƒÂµes e relatÃƒÂ³rios.',
  },
  '/hierarchy-levels': {
    title: 'NÃƒÂ­veis HierÃƒÂ¡rquicos',
    group: 'OrganizaÃƒÂ§ÃƒÂ£o',
    description: 'OrdenaÃƒÂ§ÃƒÂ£o usada nas regras de elegibilidade e hierarquia.',
  },
  '/roles': {
    title: 'FunÃƒÂ§ÃƒÂµes',
    group: 'OrganizaÃƒÂ§ÃƒÂ£o',
    description: 'FunÃƒÂ§ÃƒÂµes organizacionais e associaÃƒÂ§ÃƒÂµes opcionais de departamento ou nÃƒÂ­vel.',
  },
  '/users': {
    title: 'Utilizadores',
    group: 'OrganizaÃƒÂ§ÃƒÂ£o',
    description: 'Registos de colaboradores usados nos fluxos de atribuiÃƒÂ§ÃƒÂ£o e resultados.',
  },
  '/cycles': {
    title: 'Ciclos de AvaliaÃƒÂ§ÃƒÂ£o',
    group: 'AvaliaÃƒÂ§ÃƒÂµes',
    description: 'ConfiguraÃƒÂ§ÃƒÂ£o de perÃƒÂ­odos de avaliaÃƒÂ§ÃƒÂ£o e aÃƒÂ§ÃƒÂµes operacionais do ciclo.',
  },
  '/assignments': {
    title: 'AtribuiÃƒÂ§ÃƒÂµes',
    group: 'AvaliaÃƒÂ§ÃƒÂµes',
    description: 'AtribuiÃƒÂ§ÃƒÂµes geradas e manuais no fluxo de avaliaÃƒÂ§ÃƒÂ£o 360Ã‚Âº.',
  },
  '/submissions': {
    title: 'SubmissÃƒÂµes',
    group: 'AvaliaÃƒÂ§ÃƒÂµes',
    description: 'Estado das submissÃƒÂµes recebidas no ciclo em curso.',
  },
  '/results': {
    title: 'Resultados',
    group: 'AvaliaÃƒÂ§ÃƒÂµes',
    description: 'Vista administrativa e colaborador para a projeÃƒÂ§ÃƒÂ£o de resultados.',
  },
  '/settings': {
    title: 'DefiniÃƒÂ§ÃƒÂµes',
    group: 'Sistema',
    description: 'PreferÃƒÂªncias visuais e opÃƒÂ§ÃƒÂµes da aplicaÃƒÂ§ÃƒÂ£o.',
  },
};

export const shellBrand = {
  title: 'Persistech 360',
  subtitle: 'Portal operacional',
  icon: FiBox,
};

export const shellCycleSummary = {
  label: 'Ciclo activo',
  title: 'Ciclo de AvaliaÃƒÂ§ÃƒÂ£o 2026',
  description: 'Indicador estático do shell; não vem da API em tempo real.',
  badge: 'ReferÃƒÂªncia operacional',
};

export function getShellContext(pathname: string | null | undefined) {
  if (!pathname) {
    return routeContexts['/'];
  }

  const matchedRoute = Object.keys(routeContexts)
    .filter((route) => route === '/' || pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return routeContexts[matchedRoute ?? '/'];
}