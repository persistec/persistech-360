'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Button, Alert, Label, LoadingSpinner } from '@/components/ui';

interface Cycle { id: string; name: string; }
interface User { id: string; name: string; }

interface ResultBase {
  evaluateeId: string;
  cycleId: string;
  status: string; // 'published' | 'insufficient_responses'
  overallScore: number | null;
  dimensions: Array<{
    domainId: string;
    domainName: string;
    weight: number;
    score: number;
    criteria: Array<{
      criterionId: string;
      criterionName: string;
      score: number;
    }>;
  }>;
}

interface AdminResult extends ResultBase {
  relationships: Array<{
    relationshipType: string;
    weight: number;
    score: number;
  }>;
}

export default function ResultsPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedEvaluatee, setSelectedEvaluatee] = useState('');
  
  const [loadingResults, setLoadingResults] = useState(false);
  const [adminResult, setAdminResult] = useState<AdminResult | null>(null);
  const [employeeResult, setEmployeeResult] = useState<ResultBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('admin');

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [cyclesRes, usersRes] = await Promise.all([
          apiClient.get<{ data: Cycle[] }>('/cycles'),
          apiClient.get<{ data: User[] }>('/users'),
        ]);
        setCycles(cyclesRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error('Error fetching options:', err);
        setError('Failed to load cycles or users.');
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleFetchResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle || !selectedEvaluatee) return;
    
    setLoadingResults(true);
    setError(null);
    setAdminResult(null);
    setEmployeeResult(null);

    try {
      const [adminRes, empRes] = await Promise.all([
        apiClient.get<AdminResult>(`/cycles/${selectedCycle}/evaluatees/${selectedEvaluatee}/results/admin`),
        apiClient.get<ResultBase>(`/cycles/${selectedCycle}/evaluatees/${selectedEvaluatee}/results/employee`),
      ]);
      setAdminResult(adminRes);
      setEmployeeResult(empRes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch results. Ensure cycle is scored or assignments exist.';
      setError(msg);
    } finally {
      setLoadingResults(false);
    }
  };

  const renderResult = (data: AdminResult | ResultBase | null, isAdmin: boolean) => {
    if (!data) return null;

    if (data.status === 'insufficient_responses') {
      return (
        <Alert variant="info">
          This result has insufficient responses and cannot be fully displayed to protect anonymity.
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Overall Score</h3>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {data.overallScore !== null ? data.overallScore.toFixed(2) : 'N/A'}
          </p>
        </div>

        {isAdmin && 'relationships' in data && data.relationships && data.relationships.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Relationship Breakdown (Admin Only)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.relationships.map((rel, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-sm font-medium">{rel.relationshipType}</div>
                  <div className="text-xl font-semibold mt-1">{rel.score.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">Weight: {rel.weight}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Dimensions & Criteria</h3>
          {data.dimensions.map((dim) => (
            <div key={dim.domainId} className="mb-6 last:mb-0">
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h4 className="font-semibold text-lg">{dim.domainName} <span className="text-sm font-normal text-gray-500">(Weight: {dim.weight})</span></h4>
                <span className="font-bold text-lg bg-blue-50 text-blue-800 px-3 py-1 rounded">{dim.score.toFixed(2)}</span>
              </div>
              <ul className="space-y-2">
                {dim.criteria.map(crit => (
                  <li key={crit.criterionId} className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-700">{crit.criterionName}</span>
                    <span className="font-medium">{crit.score.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loadingOptions) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader 
        title="Results Projection" 
        description="Select a cycle and evaluatee to compare the Admin vs Employee result views."
      />

      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <form onSubmit={handleFetchResults} className="flex items-end gap-4">
          <div className="flex-1">
            <Label>Cycle</Label>
            <select
              required
              className="flex h-10 w-full mt-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
            >
              <option value="">Select Cycle</option>
              {cycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <Label>Evaluatee</Label>
            <select
              required
              className="flex h-10 w-full mt-1 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedEvaluatee}
              onChange={(e) => setSelectedEvaluatee(e.target.value)}
            >
              <option value="">Select User</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={loadingResults}>
            {loadingResults ? 'Loading...' : 'View Results'}
          </Button>
        </form>
      </div>

      {error && <Alert className="mb-6">{error}</Alert>}

      {(adminResult || employeeResult) && (
        <div>
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'admin' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('admin')}
            >
              Admin View
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'employee' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('employee')}
            >
              Employee View
            </button>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            {activeTab === 'admin' ? renderResult(adminResult, true) : renderResult(employeeResult, false)}
          </div>
        </div>
      )}
    </div>
  );
}
