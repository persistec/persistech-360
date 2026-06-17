'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Select, Label, LoadingSpinner, FormPanel, EmptyState, StatusBadge } from '@/components/ui';

interface Assignment {
  id: string;
  cycleId: string;
  evaluatorId: string;
  evaluateeId: string;
  relationshipType: string;
  status: string;
  isRequired: boolean;
}

interface User {
  id: string;
  name: string;
}

interface Cycle {
  id: string;
  name: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [formData, setFormData] = useState({ 
    cycleId: '', 
    evaluatorId: '', 
    evaluateeId: '', 
    isRequired: true 
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, usersRes, cyclesRes] = await Promise.all([
        apiClient.get<{ data: Assignment[] }>('/evaluation-assignments'),
        apiClient.get<{ data: User[] }>('/users'),
        apiClient.get<{ data: Cycle[] }>('/cycles'),
      ]);
      setAssignments(assignRes.data || []);
      setUsers(usersRes.data || []);
      setCycles(cyclesRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post('/evaluation-assignments', {
        cycleId: formData.cycleId,
        evaluatorId: formData.evaluatorId,
        evaluateeId: formData.evaluateeId,
        isRequired: formData.isRequired,
        relationshipType: 'MANUAL', // assuming manual override
      });
      
      setView('list');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    setError(null);
    try {
      await apiClient.delete(`/evaluation-assignments/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete assignment');
    }
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;
  const getCycleName = (id: string) => cycles.find(c => c.id === id)?.name || id;

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Assignments" 
        description="Inspect generated assignments and create manual assignments through the existing API contract."
        action={
          view === 'list' && (
            <Button onClick={() => setView('create')}>
              Create Manual Assignment
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Cycle', 'Evaluator', 'Evaluatee', 'Relation', 'Status', 'Required', 'Actions']}>
          {assignments.length === 0 ? (
            <EmptyState colSpan={7}>No assignments found.</EmptyState>
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium text-xs">{getCycleName(assignment.cycleId)}</TableCell>
                <TableCell>{getUserName(assignment.evaluatorId)}</TableCell>
                <TableCell>{getUserName(assignment.evaluateeId)}</TableCell>
                <TableCell>{assignment.relationshipType}</TableCell>
                <TableCell>
                  <StatusBadge tone={assignment.status === 'completed' ? 'success' : 'neutral'}>
                    {assignment.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>{assignment.isRequired ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(assignment.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title="Create Manual Assignment" className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Cycle</Label>
              <Select
                required
                value={formData.cycleId}
                onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
              >
                <option value="">Select Cycle</option>
                {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Evaluator</Label>
              <Select
                required
                value={formData.evaluatorId}
                onChange={(e) => setFormData({ ...formData, evaluatorId: e.target.value })}
              >
                <option value="">Select Evaluator</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Evaluatee</Label>
              <Select
                required
                value={formData.evaluateeId}
                onChange={(e) => setFormData({ ...formData, evaluateeId: e.target.value })}
              >
                <option value="">Select Evaluatee</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isRequired"
                className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-300"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              />
              <Label htmlFor="isRequired">Is Required</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit">Save</Button>
              <Button type="button" variant="ghost" onClick={() => {
                setView('list');
                setError(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </FormPanel>
      )}
    </div>
  );
}
