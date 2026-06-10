'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Label, LoadingSpinner } from '@/components/ui';

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
            <TableRow>
              <TableCell className="text-center text-gray-500" colSpan={5}>No roles found.</TableCell>
            </TableRow>
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
        <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-xl">
          <h2 className="text-lg font-medium mb-4">{view === 'create' ? 'Create New Role' : 'Edit Role'}</h2>
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
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">None</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Hierarchy Level (Optional)</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.hierarchyLevelId}
                onChange={(e) => setFormData({ ...formData, hierarchyLevelId: e.target.value })}
              >
                <option value="">None</option>
                {hierarchyLevels.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
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
        </div>
      )}
    </div>
  );
}
