'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Label, LoadingSpinner, FormPanel, EmptyState } from '@/components/ui';

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
      // Sort by rank ascending
      const sorted = (response.data || []).sort((a, b) => a.rank - b.rank);
      setLevels(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hierarchy levels');
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
      setError(err.message || 'Failed to save hierarchy level');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hierarchy level?')) return;
    setError(null);
    try {
      await apiClient.delete(`/hierarchy-levels/${id}`);
      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Failed to delete hierarchy level');
    }
  };

  if (loading && view === 'list') return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Hierarchy Levels" 
        description="Define rank ordering used by backend eligibility and hierarchy rules."
        action={
          view === 'list' && (
            <Button onClick={() => {
              setFormData({ id: '', name: '', rank: levels.length > 0 ? levels[levels.length - 1].rank + 1 : 1 });
              setView('create');
            }}>
              Create Level
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Name', 'Rank', 'Created At', 'Actions']}>
          {levels.length === 0 ? (
            <EmptyState colSpan={4}>No hierarchy levels found.</EmptyState>
          ) : (
            levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>{level.rank}</TableCell>
                <TableCell>{new Date(level.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => {
                      setFormData({ id: level.id, name: level.name, rank: level.rank });
                      setView('edit');
                    }}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(level.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === 'create' ? 'Create New Level' : 'Edit Level'} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Senior, Junior, Director..."
              />
            </div>
            <div>
              <Label>Rank (Higher number = higher rank)</Label>
              <Input 
                required 
                type="number"
                min="1"
                value={formData.rank} 
                onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value, 10) || 1 })} 
              />
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
