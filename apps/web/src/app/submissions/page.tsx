'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Alert, LoadingSpinner } from '@/components/ui';

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
          <TableRow>
            <TableCell className="text-center text-gray-500" colSpan={5}>No submissions found.</TableCell>
          </TableRow>
        ) : (
          submissions.map((sub) => (
            <TableRow key={sub.id}>
              <TableCell className="font-mono text-xs">{sub.id}</TableCell>
              <TableCell className="font-mono text-xs text-gray-500">{sub.assignmentId}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {sub.status}
                </span>
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
