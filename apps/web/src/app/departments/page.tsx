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

const getFriendlyErrorMessage = (err: any, action: "save" | "delete" | "fetch" = "save"): string => {
  if (err && typeof err === 'object') {
    if (err.name === 'TypeError' || err.message?.includes('fetch failed')) {
      return "Não foi possível estabelecer ligação com o servidor. Por favor, verifique a sua ligação à internet.";
    }

    const status = err.status;
    const message = (err.error?.message || err.message || "").toLowerCase();

    if (status === 401 || status === 403) {
      return "Não tem permissão para realizar esta operação.";
    }

    if (status === 404) {
      return "O departamento solicitado não foi encontrado.";
    }

    if (action === "delete") {
      if (status === 400 || message.includes("relation") || message.includes("constraint") || message.includes("foreign") || message.includes("delete")) {
        return "Não é possível eliminar este departamento porque tem utilizadores ou subdepartamentos associados.";
      }
      return err.message || "Ocorreu um erro ao tentar eliminar o departamento.";
    }

    if (status === 409) {
      return "Já existe um departamento com este nome. Por favor, escolha outro nome.";
    }

    if (status === 400) {
      if (message.includes("cycle") || message.includes("circular") || message.includes("parent")) {
        return "Relação circular detectada. O departamento ascendente não pode ser o próprio departamento nem um dos seus subdepartamentos.";
      }
      return "Os dados fornecidos são inválidos. Por favor, verifique o nome preenchido.";
    }
  }
  return err?.message || (action === "save" ? "Falha ao guardar o departamento." : action === "delete" ? "Falha ao eliminar o departamento." : "Falha ao obter os departamentos.");
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [formData, setFormData] = useState({ id: "", name: "", parentId: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<DepartmentApiItem[] >("/departments");
      setDepartments(((Array.isArray(response) ? response : [])).map(mapDepartmentFromApi));
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "fetch"));
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
    setSuccess(null);
    setView("create");
  };

  const openEditForm = (department: Department) => {
    setFormData({ id: department.id, name: department.name, parentId: department.parentId || "" });
    setError(null);
    setSuccess(null);
    setView("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const payload = buildDepartmentPayload(formData);

      if (view === "create") {
        await apiClient.post("/departments", payload);
        setSuccess("Departamento criado com sucesso.");
      } else {
        await apiClient.patch(`/departments/${formData.id}`, payload);
        setSuccess("Departamento atualizado com sucesso.");
      }

      setView("list");
      setFormData({ id: "", name: "", parentId: "" });
      await fetchDepartments();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "save"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar este departamento?")) return;
    setError(null);
    setSuccess(null);
    try {
      await apiClient.delete(`/departments/${id}`);
      setSuccess("Departamento eliminado com sucesso.");
      await fetchDepartments();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "delete"));
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

      {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}
      {success ? <Alert variant="success" className="mb-6">{success}</Alert> : null}

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
            <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
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
                  setSuccess(null);
                  setFormData({ id: "", name: "", parentId: "" });
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </FormPanel>
      )}
    </div>
  );
}
