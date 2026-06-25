"use client";

import { useEffect, useState } from "react";
import { FiCheckSquare, FiPlus, FiTrash2 } from "react-icons/fi";

import { apiClient } from "@/lib/api-client";
import { ActionBar, Alert, Button, EmptyState, FormField, FormPanel, LoadingSpinner, PageHeader, ProgressCard, Select, StatusBadge, Table, TableCell, TableRow } from "@/components/ui";

interface Assignment {
  id: string;
  cycleId: string;
  evaluatorId: string;
  evaluateeId: string;
  relationshipType: string;
  status: string;
  isRequired: boolean;
}

interface User {
  id: string;
  name: string;
}

interface Cycle {
  id: string;
  name: string;
}

const assignmentStatusLabels: Record<string, string> = {
  completed: "Concluída",
  pending: "Pendente",
  draft: "Rascunho",
};

const assignmentStatusTone = (status: string) => (status === "completed" ? "success" : status === "pending" ? "warning" : "neutral");

const relationshipLabels: Record<string, string> = {
  MANUAL: "Manual",
};

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create">("list");
  const [formData, setFormData] = useState({
    cycleId: "",
    evaluatorId: "",
    evaluateeId: "",
    isRequired: true,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, usersRes, cyclesRes] = await Promise.all([
        apiClient.get<{ data: Assignment[] }>("/evaluation-assignments"),
        apiClient.get<{ data: User[] }>("/users"),
        apiClient.get<{ data: Cycle[] }>("/cycles"),
      ]);
      setAssignments(assignRes.data || []);
      setUsers(usersRes.data || []);
      setCycles(cyclesRes.data || []);
    } catch (err: any) {
      setError(err.message || "Falha ao obter atribuições.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setFormData({ cycleId: "", evaluatorId: "", evaluateeId: "", isRequired: true });
    setView("create");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.post("/evaluation-assignments", {
        cycleId: formData.cycleId,
        evaluatorId: formData.evaluatorId,
        evaluateeId: formData.evaluateeId,
        isRequired: formData.isRequired,
        relationshipType: "MANUAL",
      });

      setView("list");
      fetchData();
    } catch (err: any) {
      setError(err.message || "Falha ao criar atribuição manual.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar esta atribuição?")) return;
    setError(null);
    try {
      await apiClient.delete(`/evaluation-assignments/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Falha ao eliminar atribuição.");
    }
  };

  const getUserName = (id: string) => users.find((user) => user.id === id)?.name || id;
  const getCycleName = (id: string) => cycles.find((cycle) => cycle.id === id)?.name || id;

  const requiredFieldsCompleted = [formData.cycleId, formData.evaluatorId, formData.evaluateeId].filter(Boolean).length;

  if (loading && view === "list") return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Atribuições"
        description="Inspeccionar atribuições geradas e criar atribuições manuais através do contrato de API existente."
        action={
          view === "list" && (
            <Button onClick={openCreateForm}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar atribuição manual
            </Button>
          )
        }
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

      {view === "list" ? (
        <Table headers={["Ciclo", "Avaliador", "Avaliado", "Relação", "Estado", "Obrigatória", "Acções"]}>
          {assignments.length === 0 ? (
            <EmptyState
              colSpan={7}
              title="Ainda não existem atribuições"
              description="Crie uma atribuição manual para testar o fluxo actual ou aguarde pela geração automática do ciclo."
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar atribuição manual
                </Button>
              }
            />
          ) : (
            assignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium text-xs">{getCycleName(assignment.cycleId)}</TableCell>
                <TableCell>{getUserName(assignment.evaluatorId)}</TableCell>
                <TableCell>{getUserName(assignment.evaluateeId)}</TableCell>
                <TableCell>{relationshipLabels[assignment.relationshipType] || assignment.relationshipType}</TableCell>
                <TableCell>
                  <StatusBadge tone={assignmentStatusTone(assignment.status)}>{assignmentStatusLabels[assignment.status] || assignment.status}</StatusBadge>
                </TableCell>
                <TableCell>{assignment.isRequired ? "Sim" : "Não"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(assignment.id)}>
                    <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title="Criar atribuição manual" className="max-w-xl">
          <div className="mb-5">
            <ProgressCard
              label="Progresso da criação"
              completed={requiredFieldsCompleted}
              total={3}
              description="A barra mostra quantos campos obrigatórios já foram preenchidos antes de guardar a atribuição."
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Ciclo" description="Escolha o ciclo onde a atribuição será aplicada." required>
              <Select required value={formData.cycleId} onChange={(event) => setFormData({ ...formData, cycleId: event.target.value })}>
                <option value="">Seleccionar ciclo</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Avaliador" description="Escolha a pessoa que vai avaliar." required>
              <Select required value={formData.evaluatorId} onChange={(event) => setFormData({ ...formData, evaluatorId: event.target.value })}>
                <option value="">Seleccionar avaliador</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Avaliado" description="Escolha a pessoa que vai ser avaliada." required>
              <Select required value={formData.evaluateeId} onChange={(event) => setFormData({ ...formData, evaluateeId: event.target.value })}>
                <option value="">Seleccionar avaliado</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="isRequired"
                  className="mt-1 h-4 w-4 rounded border-border bg-surface text-primary focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  checked={formData.isRequired}
                  onChange={(event) => setFormData({ ...formData, isRequired: event.target.checked })}
                />
                <div>
                  <label htmlFor="isRequired" className="block text-sm font-medium text-foreground">
                    Atribuição obrigatória
                  </label>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Quando activo, o fluxo trata esta atribuição como obrigatória no ciclo actual.
                  </p>
                </div>
              </div>
            </div>
            <ActionBar className="pt-4">
              <Button type="submit">
                <FiCheckSquare className="mr-2 h-4 w-4" aria-hidden="true" /> Guardar atribuição
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setView("list");
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
