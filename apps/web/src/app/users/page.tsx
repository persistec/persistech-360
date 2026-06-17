'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Select, Label, LoadingSpinner, FormPanel, EmptyState, StatusBadge } from '@/components/ui';

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
    managerId: ''
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
      setError(err.message || 'Failed to fetch data');
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
      setError(err.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setError(null);
    try {
      await apiClient.delete(`/users/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Users" 
        description="Create and maintain employee records used by assignment and results workflows."
        action={
          view === 'list' && (
            <Button onClick={() => {
              setFormData({ 
                id: '', workspaceEmail: '', name: '', status: 'ACTIVE', 
                departmentId: '', roleId: '', hierarchyLevelId: '', managerId: '' 
              });
              setView('create');
            }}>
              Create User
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Name', 'Email', 'Status', 'Dept/Role/Level', 'Actions']}>
          {users.length === 0 ? (
            <EmptyState colSpan={5}>No users found.</EmptyState>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.workspaceEmail}</TableCell>
                <TableCell>
                  <StatusBadge tone={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                    {user.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div>Dept: {departments.find(d => d.id === user.departmentId)?.name || '-'}</div>
                    <div>Role: {roles.find(r => r.id === user.roleId)?.name || '-'}</div>
                    <div>Level: {hierarchyLevels.find(l => l.id === user.hierarchyLevelId)?.name || '-'}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {
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
                    }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Create New User' : 'Edit User'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  required 
                  type="email"
                  value={formData.workspaceEmail} 
                  onChange={(e) => setFormData({ ...formData, workspaceEmail: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="ARCHIVED">Archived</option>
                </Select>
              </div>
              <div>
                <Label>Manager (Optional)</Label>
                <Select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                >
                  <option value="">None</option>
                  {users
                    .filter(u => u.id !== formData.id) // Can't manage self
                    .map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Department</Label>
                <Select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  <option value="">None</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                >
                  <option value="">None</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </div>
              <div>
                <Label>Hierarchy Level</Label>
                <Select
                  value={formData.hierarchyLevelId}
                  onChange={(e) => setFormData({ ...formData, hierarchyLevelId: e.target.value })}
                >
                  <option value="">None</option>
                  {hierarchyLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </div>
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
            
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Note: System app roles (e.g. ADMIN) are not currently exposed in the API contract and cannot be modified here.
            </p>
          </form>
        </FormPanel>
      )}
    </div>
  );
}
