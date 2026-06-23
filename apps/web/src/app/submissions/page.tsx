'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Alert, LoadingSpinner, EmptyState, StatusBadge } from '@/components/ui';

interface Submission {
  id: string;
  assignmentId: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: Submission[] }>('/evaluation-submissions');
      setSubmissions(response.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Falha ao obter submissões';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Submissões"
        description="Ver estado das submissões de avaliação. A edição de respostas não está disponível na interface de administração."
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      <Table headers={['ID da Submissão', 'ID da Atribuição', 'Estado', 'Data de Submissão', 'Data de Criação']}>
        {submissions.length === 0 ? (
          <EmptyState colSpan={5}>Nenhuma submissão encontrada.</EmptyState>
        ) : (
          submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-mono text-xs">{sub.id}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{sub.assignmentId}</TableCell>
              <TableCell>
                <StatusBadge tone={sub.status === 'SUBMITTED' ? 'success' : 'warning'}>
                  {sub.status}
                </StatusBadge>
              </TableCell>
              <TableCell>{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-'}</TableCell>
              <TableCell>{new Date(sub.createdAt).toLocaleString()}</TableCell>
            </TableRow>
          ))
        )}
      </Table>
    </div>
  );
}
