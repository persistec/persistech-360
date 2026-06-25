'use client';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare } from 'react-icons/fi';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Select, LoadingSpinner, FormPanel, EmptyState, FormField, ActionBar } from '@/components/ui';

interface DepartmentApiItem {
  id: string;
  name: string;
  parentDepartmentId: string | null;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

interface DepartmentPayload {
  name: string;
  parentDepartmentId: string | null;
}

const mapDepartmentFromApi = (department: DepartmentApiItem): Department => ({
  id: department.id,
  name: department.name,
  parentId: department.parentDepartmentId,
  createdAt: department.createdAt,
});

const buildDepartmentPayload = (formData: { name: string; parentId: string }): DepartmentPayload => {
  return {
    name: formData.name.trim(),
    parentDepartmentId: formData.parentId || null,
  };
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [formData, setFormData] = useState({ id: '', name: '', parentId: '' });

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: DepartmentApiItem[] }>('/departments');
      setDepartments((response.data || []).map(mapDepartmentFromApi));
    } catch (err: any) {
      setError(err.message || 'Falha ao obter departamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = buildDepartmentPayload(formData);

      if (view === 'create') {
        await apiClient.post('/departments', payload);
      } else {
        await apiClient.patch(`/departments/${formData.id}`, payload);
      }

      setView('list');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Falha ao guardar departamento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este departamento?')) return;
    setError(null);
    try {
      await apiClient.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar departamento');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Departamentos"
        description="Manter departamentos da organização usados por utilizadores, funções e relatórios de avaliação."
        action={
          view === 'list' && (
            <Button onClick={() => {
              setFormData({ id: '', name: '', parentId: '' });
              setView('create');
            }}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar Departamento
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Nome', 'ID Ascendente', 'Data de Criação', 'Acções']}>
          {departments.length === 0 ? (
            <EmptyState colSpan={4}>Nenhum departamento encontrado.</EmptyState>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.parentId || '-'}</TableCell>
                <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <ActionBar>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFormData({ id: dept.id, name: dept.name, parentId: dept.parentId || '' });
                        setView('edit');
                      }}
                    >
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(dept.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Criar Novo Departamento' : 'Editar Departamento'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" required>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Engenharia"
              />
            </FormField>
            <FormField label="Departamento Ascendente (Opcional)">
              <Select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              >
                <option value="">Nenhum</option>
                {departments
                  .filter((d) => d.id !== formData.id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </Select>
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
