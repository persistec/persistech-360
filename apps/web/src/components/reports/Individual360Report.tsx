import React from 'react';
import { FiAward, FiDownload, FiMap, FiMessageSquare, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { Alert, MetricCard, PageSection } from '@/components/ui';
import { IndividualReportCard } from './IndividualReportCard';
import { DimensionMetricList } from './DimensionMetricList';
import { CycleKPIsCard } from './CycleKPIsCard';
import { ReportPlaceholderCard } from './ReportPlaceholderCard';

interface DimensionData {
  domainId: string;
  domainName: string;
  weight: number;
  score: number;
  criteria: Array<{
    criterionId: string;
    criterionName: string;
    score: number;
  }>;
}

interface ReportResult {
  status: string;
  overallScore: number | null;
  dimensions: DimensionData[];
  relationships?: Array<{
    relationshipType: string;
    weight: number;
    score: number;
  }>;
}

interface Individual360ReportProps {
  result: ReportResult;
  isAdmin: boolean;
  evaluateeName: string;
  cycleName: string;
}

export function Individual360Report({ result, isAdmin, evaluateeName, cycleName }: Individual360ReportProps) {
  if (!result) return null;

  if (result.status === 'insufficient_responses') {
    return (
      <Alert variant="info">
        Este resultado tem respostas insuficientes e não pode ser totalmente exibido para proteger o anonimato.
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Secção: Identificação */}
      <IndividualReportCard evaluateeName={evaluateeName} cycleName={cycleName} />

      {/* Secção: Scores globais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Pontuação global"
          value={result.overallScore !== null ? result.overallScore.toFixed(2) : 'Indisponível'}
          description="Média ponderada do ciclo"
          icon={FiTrendingUp}
        />
        <ReportPlaceholderCard
          title="Classificação"
          description="A classificação será apresentada quando existir regra de cálculo disponível."
          icon={FiAward}
        />
        <CycleKPIsCard status={result.status} />
      </div>

      {isAdmin && result.relationships && result.relationships.length > 0 ? (
        <PageSection title="Análise por relação" description="Vista disponível apenas para Administração.">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {result.relationships.map((rel) => (
              <MetricCard
                key={rel.relationshipType}
                label={rel.relationshipType}
                value={rel.score.toFixed(2)}
                description={`Peso: ${rel.weight}`}
              />
            ))}
          </div>
        </PageSection>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Coluna Principal: Dimensões */}
        <div className="space-y-8 lg:col-span-2">
          <DimensionMetricList dimensions={result.dimensions} />

          <div className="grid gap-4 sm:grid-cols-2">
            <ReportPlaceholderCard
              title="Feedback sintetizado"
              description="A definir. Será preenchido quando houver feedback partilhado validado."
              icon={FiMessageSquare}
            />
            <ReportPlaceholderCard
              title="Evolução trimestral"
              description="A evolução trimestral será apresentada quando existirem dados históricos suficientes."
              icon={FiTrendingUp}
            />
          </div>
        </div>

        {/* Coluna Lateral: Analytics Visuais e Planos */}
        <div className="space-y-4">
          <ReportPlaceholderCard
            title="Radar de competências"
            description="Gráfico em preparação. Será apresentado com dados reais no futuro."
            icon={FiTarget}
          />
          <ReportPlaceholderCard
            title="Plano de desenvolvimento"
            description="Será preenchido quando houver recomendações validadas para este colaborador."
            icon={FiMap}
          />
          <ReportPlaceholderCard
            title="Próximo passo recomendado"
            description="A recomendação será apresentada quando existir regra definida para este relatório."
            icon={FiAward}
          />

          {/* Action Export PDF */}
          <ReportPlaceholderCard
            title="Exportação PDF"
            description="Exportação PDF será activada numa fase posterior."
            icon={FiDownload}
            action={
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center rounded-md bg-primary/50 px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
                aria-label="Exportar PDF (Desactivado)"
              >
                Exportar PDF
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
