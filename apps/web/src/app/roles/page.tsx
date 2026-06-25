'use client';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare } from 'react-icons/fi';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Select, LoadingSpinner, FormPanel, EmptyState, FormField, ActionBar } from '@/components/ui';

interface Role {
  id: string;
  name: string;
  departmentId: string | null;
  hierarchyLevelId: string | null;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

interface HierarchyLevel {
  id: string;
  name: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [formData, setFormData] = useState({ id: '', name: '', departmentId: '', hierarchyLevelId: '' });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, depsRes, levelsRes] = await Promise.all([
        apiClient.get<{ data: Role[] }>('/roles'),
        apiClient.get<{ data: Department[] }>('/departments'),
        apiClient.get<{ data: HierarchyLevel[] }>('/hierarchy-levels'),
      ]);
      setRoles(rolesRes.data || []);
      setDepartments(depsRes.data || []);
      setHierarchyLevels(levelsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao obter dados das funções');
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
      const payload = {
        name: formData.name,
        departmentId: formData.departmentId || null,
        hierarchyLevelId: formData.hierarchyLevelId || null,
      };

      if (view === 'create') {
        await apiClient.post('/roles', payload);
      } else {
        await apiClient.patch(`/roles/${formData.id}`, payload);
      }

      setView('list');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Falha ao guardar função');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta função?')) return;
    setError(null);
    try {
      await apiClient.delete(`/roles/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar função');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Funções"
        description="Gerir funções organizacionais e as suas associações opcionais de departamento ou hierarquia."
        action={
          view === 'list' && (
            <Button
              onClick={() => {
                setFormData({ id: '', name: '', departmentId: '', hierarchyLevelId: '' });
                setView('create');
              }}
            >
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar Função
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Nome', 'ID do Departamento', 'ID do Nível Hierárquico', 'Data de Criação', 'Acções']}>
          {roles.length === 0 ? (
            <EmptyState colSpan={5}>Nenhuma função encontrada.</EmptyState>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.departmentId || '-'}</TableCell>
                <TableCell>{role.hierarchyLevelId || '-'}</TableCell>
                <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <ActionBar>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFormData({
                          id: role.id,
                          name: role.name,
                          departmentId: role.departmentId || '',
                          hierarchyLevelId: role.hierarchyLevelId || '',
                        });
                        setView('edit');
                      }}
                    >
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(role.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Criar Nova Função' : 'Editar Função'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" required>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Engenheiro de Software, Gestor de Produto..."
              />
            </FormField>
            <FormField label="Departamento (Opcional)">
              <Select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                <option value="">Nenhum</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Nível Hierárquico (Opcional)">
              <Select value={formData.hierarchyLevelId} onChange={(e) => setFormData({ ...formData, hierarchyLevelId: e.target.value })}>
                <option value="">Nenhum</option>
                {hierarchyLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
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
