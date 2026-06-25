'use client';
import { FiPlus, FiEdit2, FiTrash2, FiCheckSquare } from 'react-icons/fi';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Select, LoadingSpinner, FormPanel, EmptyState, StatusBadge, FormField, ActionBar } from '@/components/ui';

interface User {
  id: string;
  workspaceEmail: string;
  name: string;
  status: string;
  departmentId: string | null;
  roleId: string | null;
  hierarchyLevelId: string | null;
  managerId: string | null;
  createdAt: string;
}

interface BasicEntity {
  id: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<BasicEntity[]>([]);
  const [hierarchyLevels, setHierarchyLevels] = useState<BasicEntity[]>([]);
  const [roles, setRoles] = useState<BasicEntity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [formData, setFormData] = useState({
    id: '',
    workspaceEmail: '',
    name: '',
    status: 'ACTIVE',
    departmentId: '',
    roleId: '',
    hierarchyLevelId: '',
    managerId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, depsRes, levelsRes, rolesRes] = await Promise.all([
        apiClient.get<{ data: User[] }>('/users'),
        apiClient.get<{ data: BasicEntity[] }>('/departments'),
        apiClient.get<{ data: BasicEntity[] }>('/hierarchy-levels'),
        apiClient.get<{ data: BasicEntity[] }>('/roles'),
      ]);
      setUsers(usersRes.data || []);
      setDepartments(depsRes.data || []);
      setHierarchyLevels(levelsRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Falha ao obter dados');
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
        workspaceEmail: formData.workspaceEmail,
        name: formData.name,
        status: formData.status,
        departmentId: formData.departmentId || null,
        roleId: formData.roleId || null,
        hierarchyLevelId: formData.hierarchyLevelId || null,
        managerId: formData.managerId || null,
      };

      if (view === 'create') {
        await apiClient.post('/users', payload);
      } else {
        await apiClient.patch(`/users/${formData.id}`, payload);
      }

      setView('list');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Falha ao guardar utilizador');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este utilizador?')) return;
    setError(null);
    try {
      await apiClient.delete(`/users/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Falha ao eliminar utilizador');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Utilizadores"
        description="Criar e manter registos de colaboradores usados nos fluxos de atribuição e resultados."
        action={
          view === 'list' && (
            <Button
              onClick={() => {
                setFormData({
                  id: '',
                  workspaceEmail: '',
                  name: '',
                  status: 'ACTIVE',
                  departmentId: '',
                  roleId: '',
                  hierarchyLevelId: '',
                  managerId: '',
                });
                setView('create');
              }}
            >
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar Utilizador
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Nome', 'Email', 'Estado', 'Dep/Função/Nível', 'Acções']}>
          {users.length === 0 ? (
            <EmptyState colSpan={5}>Nenhum utilizador encontrado.</EmptyState>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.workspaceEmail}</TableCell>
                <TableCell>
                  <StatusBadge tone={user.status === 'ACTIVE' ? 'success' : 'danger'}>{user.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>Dep: {departments.find((d) => d.id === user.departmentId)?.name || '-'}</div>
                    <div>Função: {roles.find((r) => r.id === user.roleId)?.name || '-'}</div>
                    <div>Nível: {hierarchyLevels.find((l) => l.id === user.hierarchyLevelId)?.name || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ActionBar>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFormData({
                          id: user.id,
                          workspaceEmail: user.workspaceEmail,
                          name: user.name,
                          status: user.status,
                          departmentId: user.departmentId || '',
                          roleId: user.roleId || '',
                          hierarchyLevelId: user.hierarchyLevelId || '',
                          managerId: user.managerId || '',
                        });
                        setView('edit');
                      }}
                    >
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Criar Novo Utilizador' : 'Editar Utilizador'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome" required>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </FormField>
              <FormField label="Email" required>
                <Input
                  required
                  type="email"
                  value={formData.workspaceEmail}
                  onChange={(e) => setFormData({ ...formData, workspaceEmail: e.target.value })}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Estado" required>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="ACTIVE">Activo</option>
                  <option value="SUSPENDED">Suspenso</option>
                  <option value="ARCHIVED">Arquivado</option>
                </Select>
              </FormField>
              <FormField label="Responsável (Opcional)">
                <Select value={formData.managerId} onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {users
                    .filter((u) => u.id !== formData.id)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Departamento">
                <Select value={formData.departmentId} onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Função">
                <Select value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Nível Hierárquico">
                <Select value={formData.hierarchyLevelId} onChange={(e) => setFormData({ ...formData, hierarchyLevelId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {hierarchyLevels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

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

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Nota: Funções de sistema da aplicação (ex: ADMIN) não estão expostas actualmente no contrato de API e não podem ser modificadas aqui.
            </p>
          </form>
        </FormPanel>
      )}
    </div>
  );
}
