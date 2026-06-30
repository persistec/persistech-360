"use client";

import { useEffect, useState } from "react";
import { FiCheckSquare, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { apiClient } from "@/lib/api-client";
import { ActionBar, Alert, Button, EmptyState, FormField, FormPanel, Input, LoadingSpinner, PageHeader, Select, Table, TableCell, TableRow } from "@/components/ui";

interface Role {
  id: string;
  name: string;
  departmentId: string | null;
  hierarchyLevelId: string | null;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

interface HierarchyLevel {
  id: string;
  name: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [formData, setFormData] = useState({ id: "", name: "", departmentId: "", hierarchyLevelId: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rolesRes, depsRes, levelsRes] = await Promise.all([
        apiClient.get<Role[] >("/roles"),
        apiClient.get<Department[] >("/departments"),
        apiClient.get<HierarchyLevel[] >("/hierarchy-levels"),
      ]);
      setRoles((Array.isArray(rolesRes) ? rolesRes : []));
      setDepartments((Array.isArray(depsRes) ? depsRes : []));
      setHierarchyLevels((Array.isArray(levelsRes) ? levelsRes : []));
    } catch (err: any) {
      setError(err.message || "Falha ao obter dados das funções.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setFormData({ id: "", name: "", departmentId: "", hierarchyLevelId: "" });
    setView("create");
  };

  const openEditForm = (role: Role) => {
    setFormData({
      id: role.id,
      name: role.name,
      departmentId: role.departmentId || "",
      hierarchyLevelId: role.hierarchyLevelId || "",
    });
    setView("edit");
  };

  const departmentName = (departmentId: string | null) => departments.find((department) => department.id === departmentId)?.name || "-";
  const hierarchyLevelName = (hierarchyLevelId: string | null) => hierarchyLevels.find((level) => level.id === hierarchyLevelId)?.name || "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        departmentId: formData.departmentId || null,
        hierarchyLevelId: formData.hierarchyLevelId || null,
      };

      if (view === "create") {
        await apiClient.post("/roles", payload);
      } else {
        await apiClient.patch(`/roles/${formData.id}`, payload);
      }

      setView("list");
      fetchData();
    } catch (err: any) {
      setError(err.message || "Falha ao guardar função.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar esta função?")) return;
    setError(null);
    try {
      await apiClient.delete(`/roles/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Falha ao eliminar função.");
    }
  };

  if (loading && view === "list") return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Funções"
        description="Gerir funções organizacionais e as suas associações opcionais a departamento ou nível hierárquico."
        action={
          view === "list" && (
            <Button onClick={openCreateForm}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar função
            </Button>
          )
        }
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

      {view === "list" ? (
        <Table headers={["Nome", "Departamento", "Nível hierárquico", "Data de criação", "Acções"]}>
          {roles.length === 0 ? (
            <EmptyState
              colSpan={5}
              title="Ainda não existem funções"
              description="Crie a primeira função para associar departamentos e níveis hierárquicos aos utilizadores."
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar função
                </Button>
              }
            />
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{departmentName(role.departmentId)}</TableCell>
                <TableCell>{hierarchyLevelName(role.hierarchyLevelId)}</TableCell>
                <TableCell>{new Date(role.createdAt).toLocaleDateString("pt-AO")}</TableCell>
                <TableCell>
                  <ActionBar>
                    <Button size="sm" variant="secondary" onClick={() => openEditForm(role)}>
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(role.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === "create" ? "Criar função" : "Editar função"} className="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Nome"
              description="Use um nome claro para identificar a função na organização."
              required
            >
              <Input
                required
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Engenheiro de Software, Gestor de Produto..."
              />
            </FormField>
            <FormField label="Departamento (Opcional)" description="Associa a função a um departamento específico.">
              <Select value={formData.departmentId} onChange={(event) => setFormData({ ...formData, departmentId: event.target.value })}>
                <option value="">Nenhum</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Nível hierárquico (Opcional)" description="Liga a função ao nível que melhor descreve a senioridade." >
              <Select value={formData.hierarchyLevelId} onChange={(event) => setFormData({ ...formData, hierarchyLevelId: event.target.value })}>
                <option value="">Nenhum</option>
                {hierarchyLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </Select>
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
