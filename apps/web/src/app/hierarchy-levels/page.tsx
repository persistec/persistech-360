'use client';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare } from 'react-icons/fi';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, LoadingSpinner, FormPanel, EmptyState, FormField, ActionBar } from '@/components/ui';

interface HierarchyLevel {
  id: string;
  name: string;
  rank: number;
  createdAt: string;
}

export default function HierarchyLevelsPage() {
  const [levels, setLevels] = useState<HierarchyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [formData, setFormData] = useState({ id: '', name: '', rank: 1 });

  const fetchLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: HierarchyLevel[] }>('/hierarchy-levels');
      const sorted = (response.data || []).sort((a, b) => a.rank - b.rank);
      setLevels(sorted);
    } catch (err: any) {
      setError(err.message || 'Falha ao obter níveis hierárquicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: formData.name,
        rank: Number(formData.rank),
      };

      if (view === 'create') {
        await apiClient.post('/hierarchy-levels', payload);
      } else {
        await apiClient.patch(`/hierarchy-levels/${formData.id}`, payload);
      }

      setView('list');
      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Falha ao guardar nível hierárquico');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este nível hierárquico?')) return;
    setError(null);
    try {
      await apiClient.delete(`/hierarchy-levels/${id}`);
      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar nível hierárquico');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Níveis Hierárquicos"
        description="Definir ordenação usada por regras de elegibilidade e hierarquia no backend."
        action={
          view === 'list' && (
            <Button
              onClick={() => {
                setFormData({ id: '', name: '', rank: levels.length > 0 ? levels[levels.length - 1].rank + 1 : 1 });
                setView('create');
              }}
            >
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar Nível
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Nome', 'Grau', 'Data de Criação', 'Acções']}>
          {levels.length === 0 ? (
            <EmptyState colSpan={4}>Nenhum nível hierárquico encontrado.</EmptyState>
          ) : (
            levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>{level.rank}</TableCell>
                <TableCell>{new Date(level.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <ActionBar>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFormData({ id: level.id, name: level.name, rank: level.rank });
                        setView('edit');
                      }}
                    >
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(level.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Criar Novo Nível' : 'Editar Nível'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" required>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Sénior, Júnior, Director..."
              />
            </FormField>
            <FormField label="Grau (Número mais alto = grau mais alto)" required>
              <Input
                required
                type="number"
                min="1"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value, 10) || 1 })}
              />
            </FormField>
            <ActionBar className="pt-4">
              <Button type="submit">
                <FiCheckSquare className="mr-2 h-4 w-4" aria-hidden="true" /> Guardar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setView('list');
                  setError(null);
                }}
              >
                Cancelar
              </Button>
            </ActionBar>
          </form>
        </FormPanel>
      )}
    </div>
  );
}
