import React from 'react';
import { Card } from '@/components/ui';

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

interface DimensionMetricListProps {
  dimensions: DimensionData[];
}

export function DimensionMetricList({ dimensions }: DimensionMetricListProps) {
  if (!dimensions || dimensions.length === 0) {
    return (
      <Card className="flex items-center justify-center py-8 text-sm text-muted-foreground border-dashed border-border bg-surface-muted">
        Dados insuficientes
      </Card>
    );
  }

  return (
    <Card className="space-y-6 bg-surface">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Métricas por dimensão</h3>
      </div>
      {dimensions.map((dim) => (
        <div key={dim.domainId} className="last:mb-0">
          <div className="mb-3 flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-base font-semibold text-foreground">
              {dim.domainName} <span className="text-sm font-normal text-muted-foreground">(Peso: {dim.weight})</span>
            </h4>
            <span className="inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {dim.score.toFixed(2)}
            </span>
          </div>
          <ul className="space-y-2">
            {dim.criteria.map((crit) => (
              <li key={crit.criterionId} className="flex items-center justify-between gap-4 pl-4 text-sm">
                <span className="text-muted-foreground">{crit.criterionName}</span>
                <span className="font-medium text-foreground">{crit.score.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Card>
  );
}
