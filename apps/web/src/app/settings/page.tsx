'use client';

import { PageHeader, Card } from '@/components/ui';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function SettingsPage() {
  return (
    <div>
      <PageHeader 
        title="Definições"
        description="Gerir as configurações do sistema e opções de visualização da aplicação."
      />

      <Card className="max-w-2xl">
        <h3 className="text-lg font-semibold text-foreground">Aparência</h3>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">Escolha como pretende visualizar a aplicação.</p>
        
        <div className="max-w-md">
          <ThemeSwitcher />
        </div>
      </Card>
    </div>
  );
}
