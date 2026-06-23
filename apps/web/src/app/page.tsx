import { DashboardCard, PageHeader } from "@/components/ui";

export default function Home() {
  return (
    <div>
      <PageHeader
        title="Painel"
        description="Bem-vindo ao MVP de Administração do Persistech 360. Seleccione uma opção na barra lateral para gerir dados estruturais e ciclos de avaliação."
      />

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <DashboardCard
          title="Organização"
          description="Gerir Departamentos, Níveis Hierárquicos e Funções antes de adicionar utilizadores."
        />
        <DashboardCard
          title="Utilizadores"
          description="Criar utilizadores e atribuí-los a departamentos e funções."
        />
        <DashboardCard
          title="Ciclos e Resultados"
          description="Configurar ciclos de avaliação, gerar atribuições e monitorizar resultados."
        />
      </div>
    </div>
  );
}
