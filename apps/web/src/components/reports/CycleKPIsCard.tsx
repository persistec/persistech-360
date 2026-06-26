import React from 'react';
import { Card } from '@/components/ui';

interface CycleKPIsCardProps {
  status: string;
  responseCount?: number;
}

export function CycleKPIsCard({ status, responseCount }: CycleKPIsCardProps) {
  return (
    <Card className="flex h-full flex-col bg-surface">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">KPIs do ciclo</h3>
      <div className="flex flex-1 flex-col justify-center gap-3">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-sm text-muted-foreground">Estado do resultado</span>
          <span className="text-sm font-medium text-foreground">
            {status === 'insufficient_responses' ? 'Respostas insuficientes' : 'Disponível'}
          </span>
        </div>
        {responseCount !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Respostas recebidas</span>
            <span className="text-sm font-medium text-foreground">{responseCount}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
