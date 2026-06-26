import { DashboardCard, PageHeader, PageSection } from "@/components/ui";
import { FiFolder, FiUsers, FiCalendar } from "react-icons/fi";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Painel"
        description="Bem-vindo ao portal operacional do Persistech 360. Seleccione uma opção na barra lateral para gerir dados estruturais e ciclos de avaliação."
      />

      <PageSection
        title="Acesso rápido"
        description="As áreas abaixo ajudam a orientar o trabalho diário sem alterar os fluxos existentes."
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <DashboardCard
            title="Organização"
            description="Gerir departamentos, níveis hierárquicos e funções antes de adicionar utilizadores."
            icon={FiFolder}
          />
          <DashboardCard
            title="Utilizadores"
            description="Criar utilizadores e atribuí-los a departamentos e funções."
            icon={FiUsers}
          />
          <DashboardCard
            title="Ciclos e resultados"
            description="Configurar ciclos de avaliação, gerar atribuições e acompanhar resultados."
            icon={FiCalendar}
          />
        </div>
      </PageSection>
    </div>
  );
}
