'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Label, LoadingSpinner, FormPanel, EmptyState, StatusBadge } from '@/components/ui';

interface Cycle {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  
  const [formData, setFormData] = useState({ 
    id: '', 
    name: '', 
    description: '', 
    startAt: '', 
    endAt: '' 
  });

  const fetchCycles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: Cycle[] }>('/cycles');
      setCycles(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao obter ciclos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      if (view === 'create') {
        await apiClient.post('/cycles', payload);
      } else {
        await apiClient.patch(`/cycles/${formData.id}`, payload);
      }
      
      setView('list');
      fetchCycles();
    } catch (err: any) {
      setError(err.message || 'Falha ao guardar ciclo');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este rascunho de ciclo?')) return;
    setError(null);
    try {
      await apiClient.delete(`/cycles/${id}`);
      fetchCycles();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar ciclo');
    }
  };

  const handleAction = async (id: string, action: 'open' | 'close' | 'generate-assignments') => {
    setError(null);
    try {
      await apiClient.post(`/cycles/${id}/${action}`);
      fetchCycles();
    } catch (err: any) {
      setError(err.message || `Falha ao ${action.replace('-', ' ')} ciclo`);
    }
  };

  // Helper to format datetime-local inputs
  const formatForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Ciclos de Avaliação"
        description="Configurar períodos de avaliação e accionar acções do ciclo sem alterar as regras de backend."
        action={
          view === 'list' && (
            <Button onClick={() => {
              const now = new Date();
              const nextMonth = new Date();
              nextMonth.setMonth(now.getMonth() + 1);
              
              setFormData({ 
                id: '', 
                name: '', 
                description: '', 
                startAt: now.toISOString().slice(0, 16), 
                endAt: nextMonth.toISOString().slice(0, 16) 
              });
              setView('create');
            }}>
              Criar Ciclo
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Nome', 'Estado', 'Início / Fim', 'Acções']}>
          {cycles.length === 0 ? (
            <EmptyState colSpan={4}>Nenhum ciclo encontrado.</EmptyState>
          ) : (
            cycles.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell>
                  <div className="font-medium">{cycle.name}</div>
                  <div className="text-xs text-muted-foreground">{cycle.description}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={cycle.status === 'open' ? 'success' : cycle.status === 'closed' ? 'danger' : 'neutral'}>
                    {cycle.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(cycle.startAt).toLocaleDateString()} - <br/>
                    {new Date(cycle.endAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2 w-48">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => {
                        setFormData({ 
                          id: cycle.id, 
                          name: cycle.name, 
                          description: cycle.description || '',
                          startAt: formatForInput(cycle.startAt),
                          endAt: formatForInput(cycle.endAt),
                        });
                        setView('edit');
                      }}>Editar</Button>
                      
                      {cycle.status === 'draft' && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(cycle.id)}>
                          Eliminar
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {(cycle.status === 'draft' || cycle.status === 'scheduled') && (
                        <Button size="sm" variant="primary" onClick={() => handleAction(cycle.id, 'open')}>
                          Abrir
                        </Button>
                      )}
                      {(cycle.status === 'open' || cycle.status === 'closing_soon') && (
                        <Button size="sm" variant="danger" onClick={() => handleAction(cycle.id, 'close')}>
                          Fechar
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => handleAction(cycle.id, 'generate-assignments')}>
                        Gerar Atribuições
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Criar Novo Ciclo' : 'Editar Ciclo'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Avaliação do 1.º trimestre de 2026"
              />
            </div>
            <div>
              <Label>Descrição (Opcional)</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Data de Início</Label>
                <Input 
                  type="datetime-local"
                  required 
                  value={formData.startAt} 
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} 
                />
              </div>
              <div>
                <Label>Data de Fim</Label>
                <Input 
                  type="datetime-local"
                  required 
                  value={formData.endAt} 
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })} 
                />
              </div>
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
