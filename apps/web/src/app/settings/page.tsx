'use client';

import { PageHeader, Card } from '@/components/ui';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { FiMonitor } from 'react-icons/fi';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Definições"
        description="Gerir as configurações do sistema e opções de visualização da aplicação."
      />

      <Card className="max-w-2xl">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <FiMonitor className="h-5 w-5 text-primary" aria-hidden="true" /> Aparência
        </h3>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Escolha como pretende visualizar a aplicação.</p>

        <div className="max-w-md">
          <ThemeSwitcher />
        </div>
      </Card>
    </div>
  );
}
