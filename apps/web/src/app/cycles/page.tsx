'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Table, TableRow, TableCell, Button, Alert, Input, Label, LoadingSpinner } from '@/components/ui';

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
      setError(err.message || 'Failed to fetch cycles');
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
      setError(err.message || 'Failed to save cycle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft cycle?')) return;
    setError(null);
    try {
      await apiClient.delete(`/cycles/${id}`);
      fetchCycles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete cycle');
    }
  };

  const handleAction = async (id: string, action: 'open' | 'close' | 'generate-assignments') => {
    setError(null);
    try {
      await apiClient.post(`/cycles/${id}/${action}`);
      fetchCycles();
    } catch (err: any) {
      setError(err.message || `Failed to ${action.replace('-', ' ')} cycle`);
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
        title="Evaluation Cycles" 
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
              Create Cycle
            </Button>
          )
        }
      />

      {error && <Alert className="mb-6">{error}</Alert>}

      {view === 'list' ? (
        <Table headers={['Name', 'Status', 'Start / End', 'Actions']}>
          {cycles.length === 0 ? (
            <TableRow>
              <TableCell className="text-center text-gray-500" colSpan={4}>No cycles found.</TableCell>
            </TableRow>
          ) : (
            cycles.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell>
                  <div className="font-medium">{cycle.name}</div>
                  <div className="text-xs text-gray-500">{cycle.description}</div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100`}>
                    {cycle.status}
                  </span>
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
                      }}>Edit</Button>
                      
                      {cycle.status === 'draft' && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(cycle.id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {(cycle.status === 'draft' || cycle.status === 'scheduled') && (
                        <Button size="sm" variant="primary" onClick={() => handleAction(cycle.id, 'open')}>
                          Open
                        </Button>
                      )}
                      {(cycle.status === 'open' || cycle.status === 'closing_soon') && (
                        <Button size="sm" variant="danger" onClick={() => handleAction(cycle.id, 'close')}>
                          Close
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => handleAction(cycle.id, 'generate-assignments')}>
                        Generate Assignments
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-xl">
          <h2 className="text-lg font-medium mb-4">{view === 'create' ? 'Create New Cycle' : 'Edit Cycle'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="2026 Q1 Evaluation"
              />
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input 
                  type="datetime-local"
                  required 
                  value={formData.startAt} 
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })} 
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input 
                  type="datetime-local"
                  required 
                  value={formData.endAt} 
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })} 
                />
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
          </form>
        </div>
      )}
    </div>
  );
}
