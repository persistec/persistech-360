"use client";

import { useEffect, useState } from "react";
import { FiCheckSquare, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { apiClient } from "@/lib/api-client";
import { ActionBar, Alert, Button, EmptyState, FormField, FormPanel, Input, LoadingSpinner, PageHeader, Table, TableCell, TableRow } from "@/components/ui";

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
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [formData, setFormData] = useState({ id: "", name: "", rank: 1 });

  const fetchLevels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: HierarchyLevel[] }>("/hierarchy-levels");
      const sorted = (response.data || []).sort((a, b) => a.rank - b.rank);
      setLevels(sorted);
    } catch (err: any) {
      setError(err.message || "Falha ao obter níveis hierárquicos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const openCreateForm = () => {
    setFormData({
      id: "",
      name: "",
      rank: levels.length > 0 ? levels[levels.length - 1].rank + 1 : 1,
    });
    setView("create");
  };

  const openEditForm = (level: HierarchyLevel) => {
    setFormData({ id: level.id, name: level.name, rank: level.rank });
    setView("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        rank: Number(formData.rank),
      };

      if (view === "create") {
        await apiClient.post("/hierarchy-levels", payload);
      } else {
        await apiClient.patch(`/hierarchy-levels/${formData.id}`, payload);
      }

      setView("list");
      fetchLevels();
    } catch (err: any) {
      setError(err.message || "Falha ao guardar nível hierárquico.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar este nível hierárquico?")) return;
    setError(null);
    try {
      await apiClient.delete(`/hierarchy-levels/${id}`);
      fetchLevels();
    } catch (err: any) {
      setError(err.message || "Falha ao eliminar nível hierárquico.");
    }
  };

  if (loading && view === "list") return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Níveis Hierárquicos"
        description="Definir a ordenação usada pelas regras de hierarquia e de elegibilidade no backend."
        action={
          view === "list" && (
            <Button onClick={openCreateForm}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar nível
            </Button>
          )
        }
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

      {view === "list" ? (
        <Table headers={["Nome", "Grau", "Data de criação", "Acções"]}>
          {levels.length === 0 ? (
            <EmptyState
              colSpan={4}
              title="Ainda não existem níveis hierárquicos"
              description="Crie o primeiro nível para começar a estruturar a ordem de avaliação e a hierarquia da organização."
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar nível
                </Button>
              }
            />
          ) : (
            levels.map((level) => (
              <TableRow key={level.id}>
                <TableCell className="font-medium">{level.name}</TableCell>
                <TableCell>{level.rank}</TableCell>
                <TableCell>{new Date(level.createdAt).toLocaleDateString("pt-AO")}</TableCell>
                <TableCell>
                  <ActionBar>
                    <Button size="sm" variant="secondary" onClick={() => openEditForm(level)}>
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(level.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === "create" ? "Criar nível" : "Editar nível"} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Nome"
              description="Use nomes simples e coerentes com a estrutura da organização."
              required
            >
              <Input
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Sénior, Júnior, Director..."
              />
            </FormField>
            <FormField
              label="Grau"
              description="Quanto maior o número, mais elevado é o grau."
              required
            >
              <Input
                required
                type="number"
                min="1"
                value={formData.rank}
                onChange={(event) => setFormData({ ...formData, rank: parseInt(event.target.value, 10) || 1 })}
              />
            </FormField>
            <ActionBar className="pt-4">
              <Button type="submit">
                <FiCheckSquare className="mr-2 h-4 w-4" aria-hidden="true" /> Guardar
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
