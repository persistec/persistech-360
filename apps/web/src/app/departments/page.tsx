'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Select, Label, LoadingSpinner, FormPanel, EmptyState } from '@/components/ui';

interface Department {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

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
      const response = await apiClient.get<{ data: Department[] }>('/departments');
      setDepartments(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
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
      const payload = {
        name: formData.name,
        parentId: formData.parentId || null,
      };

      if (view === 'create') {
        await apiClient.post('/departments', payload);
      } else {
        await apiClient.patch(`/departments/${formData.id}`, payload);
      }
      
      setView('list');
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to save department');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    setError(null);
    try {
      await apiClient.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete department');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Departments" 
        description="Maintain organization departments used by users, roles, and evaluation reporting."
        action={
          view === 'list' && (
            <Button onClick={() => {
              setFormData({ id: '', name: '', parentId: '' });
              setView('create');
            }}>
              Create Department
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Name', 'Parent ID', 'Created At', 'Actions']}>
          {departments.length === 0 ? (
            <EmptyState colSpan={4}>No departments found.</EmptyState>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.parentId || '-'}</TableCell>
                <TableCell>{new Date(dept.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setFormData({ id: dept.id, name: dept.name, parentId: dept.parentId || '' });
                      setView('edit');
                    }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(dept.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Create New Department' : 'Edit Department'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Engineering"
              />
            </div>
            <div>
              <Label>Parent Department (Optional)</Label>
              <Select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              >
                <option value="">None</option>
                {departments
                  .filter(d => d.id !== formData.id) // Cannot be own parent
                  .map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))
                }
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
