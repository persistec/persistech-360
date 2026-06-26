"use client";

import { useEffect, useState } from "react";
import { FiCheckSquare, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { apiClient } from "@/lib/api-client";
import { ActionBar, Alert, Button, EmptyState, FormField, FormPanel, Input, LoadingSpinner, PageHeader, Select, Table, TableCell, TableRow } from "@/components/ui";

interface DepartmentApiItem {
  id: string;
  name: string;
  parentDepartmentId: string | null;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

interface DepartmentPayload {
  name: string;
  parentDepartmentId: string | null;
}

const mapDepartmentFromApi = (department: DepartmentApiItem): Department => ({
  id: department.id,
  name: department.name,
  parentId: department.parentDepartmentId,
  createdAt: department.createdAt,
});

const buildDepartmentPayload = (formData: { name: string; parentId: string }): DepartmentPayload => ({
  name: formData.name.trim(),
  parentDepartmentId: formData.parentId || null,
});

const getDescendantIds = (departments: Department[], parentId: string): string[] => {
  const ids: string[] = [];
  const findChildren = (id: string) => {
    departments.forEach((dept) => {
      if (dept.parentId === id) {
        ids.push(dept.id);
        findChildren(dept.id);
      }
    });
  };
  findChildren(parentId);
  return ids;
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [formData, setFormData] = useState({ id: "", name: "", parentId: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: DepartmentApiItem[] }>("/departments");
      setDepartments((response.data || []).map(mapDepartmentFromApi));
    } catch (err: any) {
      setError(err.message || "Falha ao obter departamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateForm = () => {
    setFormData({ id: "", name: "", parentId: "" });
    setError(null);
    setView("create");
  };

  const openEditForm = (department: Department) => {
    setFormData({ id: department.id, name: department.name, parentId: department.parentId || "" });
    setError(null);
    setView("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload = buildDepartmentPayload(formData);

      if (view === "create") {
        await apiClient.post("/departments", payload);
      } else {
        await apiClient.patch(`/departments/${formData.id}`, payload);
      }

      setView("list");
      setFormData({ id: "", name: "", parentId: "" });
      await fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Falha ao guardar departamento.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar este departamento?")) return;
    setError(null);
    try {
      await apiClient.delete(`/departments/${id}`);
      await fetchDepartments();
    } catch (err: any) {
      setError(err.message || "Falha ao eliminar departamento.");
    }
  };

  if (loading && view === "list") return <LoadingSpinner />;

  const parentName = (parentId: string | null) => departments.find((department) => department.id === parentId)?.name || "-";

  const descendantIds = formData.id ? getDescendantIds(departments, formData.id) : [];
  const eligibleDepartments = departments.filter(
    (dept) => dept.id !== formData.id && !descendantIds.includes(dept.id)
  );

  return (
    <div>
      <PageHeader
        title="Departamentos"
        description="Manter departamentos da organização usados por utilizadores, funções e relatórios de avaliação."
        action={
          view === "list" && (
            <Button onClick={openCreateForm}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar departamento
            </Button>
          )
        }
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

      {view === "list" ? (
        <Table headers={["Nome", "Departamento ascendente", "Data de criação", "Acções"]}>
          {departments.length === 0 ? (
            <EmptyState
              colSpan={4}
              title="Ainda não existem departamentos"
              description="Crie o primeiro departamento para começar a estruturar a organização e ligar utilizadores às áreas certas."
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar departamento
                </Button>
              }
            />
          ) : (
            departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell>{parentName(department.parentId)}</TableCell>
                <TableCell>{new Date(department.createdAt).toLocaleDateString("pt-AO")}</TableCell>
                <TableCell>
                  <ActionBar>
                    <Button size="sm" variant="secondary" onClick={() => openEditForm(department)}>
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(department.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === "create" ? "Criar departamento" : "Editar departamento"} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Nome"
              description="Use um nome curto e claro para facilitar a leitura nas listas e nos relatórios."
              required
            >
              <Input
                required
                disabled={submitting}
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Engenharia"
              />
            </FormField>
            <FormField
              label="Departamento ascendente (Opcional)"
              description="Opcional. Ajuda a organizar a estrutura hierárquica da organização."
            >
              <Select
                disabled={submitting}
                value={formData.parentId}
                onChange={(event) => setFormData({ ...formData, parentId: event.target.value })}
              >
                <option value="">Nenhum</option>
                {eligibleDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <ActionBar className="pt-4 flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2">
              <Button type="submit" loading={submitting} className="w-full sm:w-auto">
                <FiCheckSquare className="mr-2 h-4 w-4" aria-hidden="true" /> {submitting ? "A guardar..." : "Guardar"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                className="w-full sm:w-auto"
                onClick={() => {
                  setView("list");
                  setError(null);
                  setFormData({ id: "", name: "", parentId: "" });
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
