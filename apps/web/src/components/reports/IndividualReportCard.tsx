import React from 'react';
import { Card } from '@/components/ui';
import { FiUser } from 'react-icons/fi';

interface IndividualReportCardProps {
  evaluateeName: string;
  cycleName: string;
}

export function IndividualReportCard({ evaluateeName, cycleName }: IndividualReportCardProps) {
  return (
    <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-border bg-surface">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FiUser className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Relatório individual 360°</h2>
          <p className="text-sm font-medium text-muted-foreground">Ficha de desempenho</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1 text-sm sm:mt-0 sm:text-right">
        <span className="font-semibold text-foreground">{evaluateeName}</span>
        <span className="text-muted-foreground">{cycleName}</span>
      </div>
    </Card>
  );
}
