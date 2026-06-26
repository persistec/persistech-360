import React from 'react';
import { Card } from '@/components/ui';
import { IconType } from 'react-icons';

interface ReportPlaceholderCardProps {
  title: string;
  description: string;
  icon?: IconType;
  action?: React.ReactNode;
}

export function ReportPlaceholderCard({ title, description, icon: Icon, action }: ReportPlaceholderCardProps) {
  return (
    <Card className="flex h-full flex-col border-dashed border-border bg-surface-muted">
      <div className="mb-4 flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </Card>
  );
}
