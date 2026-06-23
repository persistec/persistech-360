'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Select, Label, LoadingSpinner, FormPanel, EmptyState } from '@/components/ui';

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
      setError(err.message || 'Failed to fetch roles data');
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
      setError(err.message || 'Failed to save role');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    setError(null);
    try {
      await apiClient.delete(`/roles/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Roles" 
        description="Manage organizational roles and their optional department or hierarchy associations."
        action={
          view === 'list' && (
            <Button onClick={() => {
              setFormData({ id: '', name: '', departmentId: '', hierarchyLevelId: '' });
              setView('create');
            }}>
              Create Role
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Name', 'Department ID', 'Hierarchy Level ID', 'Created At', 'Actions']}>
          {roles.length === 0 ? (
            <EmptyState colSpan={5}>No roles found.</EmptyState>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.departmentId || '-'}</TableCell>
                <TableCell>{role.hierarchyLevelId || '-'}</TableCell>
                <TableCell>{new Date(role.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setFormData({ 
                        id: role.id, 
                        name: role.name, 
                        departmentId: role.departmentId || '',
                        hierarchyLevelId: role.hierarchyLevelId || '',
                      });
                      setView('edit');
                    }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(role.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Create New Role' : 'Edit Role'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Software Engineer, Product Manager..."
              />
            </div>
            <div>
              <Label>Department (Optional)</Label>
              <Select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">None</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Hierarchy Level (Optional)</Label>
              <Select
                value={formData.hierarchyLevelId}
                onChange={(e) => setFormData({ ...formData, hierarchyLevelId: e.target.value })}
              >
                <option value="">None</option>
                {hierarchyLevels.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
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
