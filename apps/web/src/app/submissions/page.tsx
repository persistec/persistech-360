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
      const msg = err instanceof Error ? err.message : 'Failed to fetch submissions';
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
        title="Submissions" 
        description="View status of evaluation submissions. Answer editing is not available in the admin UI."
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      <Table headers={['Submission ID', 'Assignment ID', 'Status', 'Submitted At', 'Created At']}>
        {submissions.length === 0 ? (
          <EmptyState colSpan={5}>No submissions found.</EmptyState>
        ) : (
          submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-mono text-xs">{sub.id}</TableCell>
              <TableCell className="font-mono text-xs text-slate-400">{sub.assignmentId}</TableCell>
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
