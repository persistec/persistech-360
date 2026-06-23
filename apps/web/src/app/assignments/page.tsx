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
      setError(err.message || 'Falha ao obter atribuições');
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
      setError(err.message || 'Falha ao criar atribuição');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta atribuição?')) return;
    setError(null);
    try {
      await apiClient.delete(`/evaluation-assignments/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar atribuição');
    }
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || id;
  const getCycleName = (id: string) => cycles.find(c => c.id === id)?.name || id;

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Atribuições"
        description="Inspeccionar atribuições geradas e criar atribuições manuais através do contrato de API existente."
        action={
          view === 'list' && (
            <Button onClick={() => setView('create')}>
              Criar Atribuição Manual
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Ciclo', 'Avaliador', 'Avaliado', 'Relação', 'Estado', 'Obrigatório', 'Acções']}>
          {assignments.length === 0 ? (
            <EmptyState colSpan={7}>Nenhuma atribuição encontrada.</EmptyState>
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
                <TableCell>{assignment.isRequired ? 'Sim' : 'Não'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(assignment.id)}>
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title="Criar Atribuição Manual" className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Ciclo</Label>
              <Select
                required
                value={formData.cycleId}
                onChange={(e) => setFormData({ ...formData, cycleId: e.target.value })}
              >
                <option value="">Seleccionar Ciclo</option>
                {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Avaliador</Label>
              <Select
                required
                value={formData.evaluatorId}
                onChange={(e) => setFormData({ ...formData, evaluatorId: e.target.value })}
              >
                <option value="">Seleccionar Avaliador</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Avaliado</Label>
              <Select
                required
                value={formData.evaluateeId}
                onChange={(e) => setFormData({ ...formData, evaluateeId: e.target.value })}
              >
                <option value="">Seleccionar Avaliado</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="isRequired"
                className="h-4 w-4 rounded border-border bg-input/20 text-primary focus:ring-primary/80"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              />
              <Label htmlFor="isRequired">É Obrigatório</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit">Guardar</Button>
              <Button type="button" variant="ghost" onClick={() => {
                setView('list');
                setError(null);
              }}>
                Cancelar
              </Button>
            </div>
          </form>
        </FormPanel>
      )}
    </div>
  );
}
