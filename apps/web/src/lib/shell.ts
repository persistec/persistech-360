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
    title: 'Visão Geral',
    description: 'Atalhos e contexto operacional.',
    items: [{ href: '/', label: 'Painel', icon: FiGrid }],
  },
  {
    title: 'Organização',
    description: 'Estrutura de base da avaliação.',
    items: [
      { href: '/departments', label: 'Departamentos', icon: FiFolder },
      { href: '/hierarchy-levels', label: 'Níveis Hierárquicos', icon: FiLayers },
      { href: '/roles', label: 'Funções', icon: FiBriefcase },
      { href: '/users', label: 'Utilizadores', icon: FiUsers },
    ],
  },
  {
    title: 'Avaliações',
    description: 'Ciclos, atribuições e submissões.',
    items: [
      { href: '/cycles', label: 'Ciclos de Avaliação', icon: FiCalendar },
      { href: '/assignments', label: 'Atribuições', icon: FiClipboard },
      { href: '/submissions', label: 'Submissões', icon: FiCheckSquare },
      { href: '/results', label: 'Resultados', icon: FiTrendingUp },
    ],
  },
  {
    title: 'Sistema',
    description: 'Preferências e configurações da interface.',
    items: [{ href: '/settings', label: 'Definições', icon: FiSettings }],
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
    group: 'Visão Geral',
    description: 'Resumo operacional e atalhos da administração interna.',
  },
  '/departments': {
    title: 'Departamentos',
    group: 'Organização',
    description: 'Estrutura hierárquica de base usada por utilizadores, funções e relatórios.',
  },
  '/hierarchy-levels': {
    title: 'Níveis Hierárquicos',
    group: 'Organização',
    description: 'Ordenação usada nas regras de elegibilidade e hierarquia.',
  },
  '/roles': {
    title: 'Funções',
    group: 'Organização',
    description: 'Funções organizacionais e associações opcionais de departamento ou nível.',
  },
  '/users': {
    title: 'Utilizadores',
    group: 'Organização',
    description: 'Registos de colaboradores usados nos fluxos de atribuição e resultados.',
  },
  '/cycles': {
    title: 'Ciclos de Avaliação',
    group: 'Avaliações',
    description: 'Configuração de períodos de avaliação e ações operacionais do ciclo.',
  },
  '/assignments': {
    title: 'Atribuições',
    group: 'Avaliações',
    description: 'Atribuições geradas e manuais no fluxo de avaliação 360º.',
  },
  '/submissions': {
    title: 'Submissões',
    group: 'Avaliações',
    description: 'Estado das submissões recebidas no ciclo em curso.',
  },
  '/results': {
    title: 'Resultados',
    group: 'Avaliações',
    description: 'Vista administrativa e colaborador para a projeção de resultados.',
  },
  '/settings': {
    title: 'Definições',
    group: 'Sistema',
    description: 'Preferências visuais e opções da aplicação.',
  },
};

export const shellBrand = {
  title: 'Persistech 360',
  subtitle: 'Portal operacional',
  icon: FiBox,
};

export const shellCycleSummary = {
  label: 'Ciclo activo',
  title: 'Ciclo de Avaliação 2026',
  description: 'Indicador estático do shell; não vem da API em tempo real.',
  badge: 'Referência operacional',
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