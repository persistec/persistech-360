'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PageHeader, Button, Alert, Select, LoadingSpinner, Card, FormField, MetricCard, PageSection, ActionBar } from '@/components/ui';
import { FiTrendingUp } from 'react-icons/fi';

interface Cycle {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface ResultBase {
  evaluateeId: string;
  cycleId: string;
  status: string;
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
        setError('Falha ao carregar ciclos ou utilizadores.');
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
      const msg = err instanceof Error ? err.message : 'Falha ao obter resultados. Certifique-se de que o ciclo foi pontuado ou que existem atribuições.';
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
          Este resultado tem respostas insuficientes e não pode ser totalmente exibido para proteger o anonimato.
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <MetricCard
          label="Pontuação Global"
          value={data.overallScore !== null ? data.overallScore.toFixed(2) : 'N/A'}
          description="Resumo agregado disponível para este avaliado neste ciclo."
          icon={FiTrendingUp}
        />

        {isAdmin && 'relationships' in data && data.relationships && data.relationships.length > 0 ? (
          <PageSection title="Análise por Relação" description="Vista disponível apenas para Administração.">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {data.relationships.map((rel) => (
                <MetricCard
                  key={rel.relationshipType}
                  label={rel.relationshipType}
                  value={rel.score.toFixed(2)}
                  description={`Peso: ${rel.weight}`}
                />
              ))}
            </div>
          </PageSection>
        ) : null}

        <PageSection title="Dimensões e Critérios">
          <Card className="space-y-6">
            {data.dimensions.map((dim) => (
              <div key={dim.domainId} className="last:mb-0">
                <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                  <h4 className="text-lg font-semibold text-foreground">
                    {dim.domainName} <span className="text-sm font-normal text-muted-foreground">(Peso: {dim.weight})</span>
                  </h4>
                  <span className="rounded border border-primary/35 bg-primary/10 px-3 py-1 text-lg font-bold text-primary">
                    {dim.score.toFixed(2)}
                  </span>
                </div>
                <ul className="space-y-2">
                  {dim.criteria.map((crit) => (
                    <li key={crit.criterionId} className="flex items-center justify-between pl-4 text-sm">
                      <span className="text-muted-foreground">{crit.criterionName}</span>
                      <span className="font-medium text-foreground">{crit.score.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        </PageSection>
      </div>
    );
  };

  if (loadingOptions) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Projecção de Resultados"
        description="Seleccione um ciclo e um avaliado para comparar as vistas de resultados entre Administração e Colaborador."
      />

      <Card className="mb-8">
        <form onSubmit={handleFetchResults} className="grid items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
          <FormField label="Ciclo" required>
            <Select required value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)}>
              <option value="">Seleccionar Ciclo</option>
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Avaliado" required>
            <Select required value={selectedEvaluatee} onChange={(e) => setSelectedEvaluatee(e.target.value)}>
              <option value="">Seleccionar Utilizador</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </FormField>
          <Button type="submit" disabled={loadingResults} loading={loadingResults}>
            Ver Resultados
          </Button>
        </form>
      </Card>

      {error && <Alert className="mb-6">{error}</Alert>}

      {(adminResult || employeeResult) && (
        <div>
          <ActionBar className="mb-6 border-b border-border">
            <Button
              type="button"
              variant={activeTab === 'admin' ? 'secondary' : 'ghost'}
              className={`rounded-b-none border-b-2 px-4 py-2 ${activeTab === 'admin' ? 'border-primary text-primary' : 'border-transparent'}`}
              onClick={() => setActiveTab('admin')}
            >
              Vista de Administração
            </Button>
            <Button
              type="button"
              variant={activeTab === 'employee' ? 'secondary' : 'ghost'}
              className={`rounded-b-none border-b-2 px-4 py-2 ${activeTab === 'employee' ? 'border-primary text-primary' : 'border-transparent'}`}
              onClick={() => setActiveTab('employee')}
            >
              Vista de Colaborador
            </Button>
          </ActionBar>

          <div className="rounded-lg bg-background/30 p-1 sm:p-3">{activeTab === 'admin' ? renderResult(adminResult, true) : renderResult(employeeResult, false)}</div>
        </div>
      )}
    </div>
  );
}
