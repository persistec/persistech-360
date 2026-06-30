"use client";

import { useEffect, useState } from "react";
import { FiCheckSquare, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { apiClient } from "@/lib/api-client";
import { ActionBar, Alert, Button, EmptyState, FormField, FormPanel, Input, LoadingSpinner, PageHeader, ProgressCard, StatusBadge, Table, TableCell, TableRow } from "@/components/ui";

interface Cycle {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

const cycleStatusLabels: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendado",
  open: "Aberto",
  closing_soon: "A fechar",
  closed: "Fechado",
};

const cycleStatusTone = (status: string) => (status === "open" ? "success" : status === "closed" ? "danger" : status === "closing_soon" ? "warning" : "neutral");

const actionLabels: Record<string, string> = {
  open: "abrir",
  close: "fechar",
  "generate-assignments": "gerar atribuições",
};

export default function CyclesPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create" | "edit">("list");

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    startAt: "",
    endAt: "",
  });

  const fetchCycles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Cycle[] >("/cycles");
      setCycles((Array.isArray(response) ? response : []));
    } catch (err: any) {
      setError(err.message || "Falha ao obter ciclos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const openCreateForm = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    setFormData({
      id: "",
      name: "",
      description: "",
      startAt: now.toISOString().slice(0, 16),
      endAt: nextMonth.toISOString().slice(0, 16),
    });
    setView("create");
  };

  const openEditForm = (cycle: Cycle) => {
    setFormData({
      id: cycle.id,
      name: cycle.name,
      description: cycle.description || "",
      startAt: formatForInput(cycle.startAt),
      endAt: formatForInput(cycle.endAt),
    });
    setView("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
      };

      if (view === "create") {
        await apiClient.post("/cycles", payload);
      } else {
        await apiClient.patch(`/cycles/${formData.id}`, payload);
      }

      setView("list");
      fetchCycles();
    } catch (err: any) {
      setError(err.message || "Falha ao guardar ciclo.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar este rascunho de ciclo?")) return;
    setError(null);
    try {
      await apiClient.delete(`/cycles/${id}`);
      fetchCycles();
    } catch (err: any) {
      setError(err.message || "Falha ao eliminar ciclo.");
    }
  };

  const handleAction = async (id: string, action: "open" | "close" | "generate-assignments") => {
    setError(null);
    try {
      await apiClient.post(`/cycles/${id}/${action}`);
      fetchCycles();
    } catch (err: any) {
      setError(err.message || `Falha ao ${actionLabels[action]} ciclo.`);
    }
  };

  const formatForInput = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const requiredFieldsCompleted = [formData.name, formData.startAt, formData.endAt].filter(Boolean).length;

  if (loading && view === "list") return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Ciclos de Avaliação"
        description="Configurar períodos de avaliação e accionar acções do ciclo sem alterar as regras de backend."
        action={
          view === "list" && (
            <Button onClick={openCreateForm}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar ciclo
            </Button>
          )
        }
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

      {view === "list" ? (
        <Table headers={["Nome", "Estado", "Início / Fim", "Acções"]}>
          {cycles.length === 0 ? (
            <EmptyState
              colSpan={4}
              title="Ainda não existem ciclos"
              description="Crie o primeiro ciclo para poder abrir avaliações, gerar atribuições e acompanhar resultados."
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar ciclo
                </Button>
              }
            />
          ) : (
            cycles.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell>
                  <div className="font-medium">{cycle.name}</div>
                  <div className="text-xs text-muted-foreground">{cycle.description || "Sem descrição adicional."}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge tone={cycleStatusTone(cycle.status)}>{cycleStatusLabels[cycle.status] || cycle.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-foreground">
                    {new Date(cycle.startAt).toLocaleString("pt-AO")} - <br />
                    {new Date(cycle.endAt).toLocaleString("pt-AO")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex w-48 flex-col gap-2">
                    <ActionBar>
                      <Button size="sm" variant="secondary" onClick={() => openEditForm(cycle)}>
                        <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                      </Button>
                      {cycle.status === "draft" ? (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(cycle.id)}>
                          <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                        </Button>
                      ) : null}
                    </ActionBar>

                    <ActionBar>
                      {cycle.status === "draft" || cycle.status === "scheduled" ? (
                        <Button size="sm" variant="primary" onClick={() => handleAction(cycle.id, "open")}>
                          Abrir
                        </Button>
                      ) : null}
                      {cycle.status === "open" || cycle.status === "closing_soon" ? (
                        <Button size="sm" variant="danger" onClick={() => handleAction(cycle.id, "close")}>
                          Fechar
                        </Button>
                      ) : null}
                      <Button size="sm" variant="secondary" onClick={() => handleAction(cycle.id, "generate-assignments")}>
                        Gerar atribuições
                      </Button>
                    </ActionBar>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === "create" ? "Criar ciclo" : "Editar ciclo"} className="max-w-xl">
          <div className="mb-5">
            <ProgressCard
              label="Progresso da configuração"
              completed={requiredFieldsCompleted}
              total={3}
              description="A barra mostra quantos campos obrigatórios já foram preenchidos antes de guardar o ciclo."
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nome" description="Use um nome claro para identificar o período de avaliação." required>
              <Input
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Avaliação do 1.º trimestre de 2026"
              />
            </FormField>
            <FormField label="Descrição" description="Opcional. Ajuda a distinguir ciclos semelhantes.">
              <Input value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Data de início" description="Momento em que o ciclo fica disponível." required>
                <Input
                  type="datetime-local"
                  required
                  value={formData.startAt}
                  onChange={(event) => setFormData({ ...formData, startAt: event.target.value })}
                />
              </FormField>
              <FormField label="Data de fim" description="Momento em que o ciclo deixa de aceitar submissões." required>
                <Input
                  type="datetime-local"
                  required
                  value={formData.endAt}
                  onChange={(event) => setFormData({ ...formData, endAt: event.target.value })}
                />
              </FormField>
            </div>

            <ActionBar className="pt-4">
              <Button type="submit">
                <FiCheckSquare className="mr-2 h-4 w-4" aria-hidden="true" /> Guardar ciclo
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
