"use client";

import { useEffect, useState } from "react";
import { FiCheckSquare, FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { apiClient } from "@/lib/api-client";
import { ActionBar, Alert, Button, EmptyState, FormField, FormPanel, Input, LoadingSpinner, PageHeader, Select, StatusBadge, Table, TableCell, TableRow } from "@/components/ui";

interface User {
  id: string;
  workspaceEmail: string;
  name: string;
  status: string;
  departmentId: string | null;
  roleId: string | null;
  hierarchyLevelId: string | null;
  managerId: string | null;
  createdAt: string;
}

interface BasicEntity {
  id: string;
  name: string;
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Activo",
  SUSPENDED: "Suspenso",
  ARCHIVED: "Arquivado",
};

const statusTone = (status: string) => (status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "warning" : "neutral");

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<BasicEntity[]>([]);
  const [hierarchyLevels, setHierarchyLevels] = useState<BasicEntity[]>([]);
  const [roles, setRoles] = useState<BasicEntity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [formData, setFormData] = useState({
    id: "",
    workspaceEmail: "",
    name: "",
    status: "ACTIVE",
    departmentId: "",
    roleId: "",
    hierarchyLevelId: "",
    managerId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, depsRes, levelsRes, rolesRes] = await Promise.all([
        apiClient.get<{ data: User[] }>("/users"),
        apiClient.get<{ data: BasicEntity[] }>("/departments"),
        apiClient.get<{ data: BasicEntity[] }>("/hierarchy-levels"),
        apiClient.get<{ data: BasicEntity[] }>("/roles"),
      ]);
      setUsers(usersRes.data || []);
      setDepartments(depsRes.data || []);
      setHierarchyLevels(levelsRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (err: any) {
      setError(err.message || "Falha ao obter dados dos utilizadores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setFormData({
      id: "",
      workspaceEmail: "",
      name: "",
      status: "ACTIVE",
      departmentId: "",
      roleId: "",
      hierarchyLevelId: "",
      managerId: "",
    });
    setView("create");
  };

  const openEditForm = (user: User) => {
    setFormData({
      id: user.id,
      workspaceEmail: user.workspaceEmail,
      name: user.name,
      status: user.status,
      departmentId: user.departmentId || "",
      roleId: user.roleId || "",
      hierarchyLevelId: user.hierarchyLevelId || "",
      managerId: user.managerId || "",
    });
    setView("edit");
  };

  const getEntityName = (collection: BasicEntity[], id: string | null) => collection.find((item) => item.id === id)?.name || "-";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        workspaceEmail: formData.workspaceEmail.trim(),
        name: formData.name.trim(),
        status: formData.status,
        departmentId: formData.departmentId || null,
        roleId: formData.roleId || null,
        hierarchyLevelId: formData.hierarchyLevelId || null,
        managerId: formData.managerId || null,
      };

      if (view === "create") {
        await apiClient.post("/users", payload);
      } else {
        await apiClient.patch(`/users/${formData.id}`, payload);
      }

      setView("list");
      fetchData();
    } catch (err: any) {
      setError(err.message || "Falha ao guardar utilizador.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza de que pretende eliminar este utilizador?")) return;
    setError(null);
    try {
      await apiClient.delete(`/users/${id}`);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Falha ao eliminar utilizador.");
    }
  };

  if (loading && view === "list") return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Utilizadores"
        description="Criar e manter registos de colaboradores usados nos fluxos de atribuição e resultados."
        action={
          view === "list" && (
            <Button onClick={openCreateForm}>
              <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar utilizador
            </Button>
          )
        }
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

      {view === "list" ? (
        <Table headers={["Nome", "Email", "Estado", "Estrutura", "Acções"]}>
          {users.length === 0 ? (
            <EmptyState
              colSpan={5}
              title="Ainda não existem utilizadores"
              description="Adicione o primeiro utilizador para começar a ligar colaboradores a departamentos, funções e ciclos de avaliação."
              action={
                <Button size="sm" onClick={openCreateForm}>
                  <FiPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Criar utilizador
                </Button>
              }
            />
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.workspaceEmail}</TableCell>
                <TableCell>
                  <StatusBadge tone={statusTone(user.status)}>{statusLabels[user.status] || user.status}</StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Departamento: {getEntityName(departments, user.departmentId)}</div>
                    <div>Função: {getEntityName(roles, user.roleId)}</div>
                    <div>Nível: {getEntityName(hierarchyLevels, user.hierarchyLevelId)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ActionBar>
                    <Button size="sm" variant="secondary" onClick={() => openEditForm(user)}>
                      <FiEdit2 className="mr-2 h-4 w-4" aria-hidden="true" /> Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>
                      <FiTrash2 className="mr-2 h-4 w-4" aria-hidden="true" /> Eliminar
                    </Button>
                  </ActionBar>
                </TableCell>
              </TableRow>
            ))
          )}
        </Table>
      ) : (
        <FormPanel title={view === "create" ? "Criar utilizador" : "Editar utilizador"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Nome" description="Nome visível nas listas, atribuições e resultados." required>
                <Input
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  placeholder="Nome completo"
                />
              </FormField>
              <FormField label="Email de trabalho" description="Será usado como endereço principal do utilizador." required>
                <Input
                  required
                  type="email"
                  value={formData.workspaceEmail}
                  onChange={(event) => setFormData({ ...formData, workspaceEmail: event.target.value })}
                  placeholder="nome@empresa.co.ao"
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Estado" description="Controla se o utilizador fica activo para os fluxos actuais." required>
                <Select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })}>
                  <option value="ACTIVE">Activo</option>
                  <option value="SUSPENDED">Suspenso</option>
                  <option value="ARCHIVED">Arquivado</option>
                </Select>
              </FormField>
              <FormField label="Responsável directo (Opcional)" description="Opcional. Associa o utilizador ao seu responsável directo.">
                <Select value={formData.managerId} onChange={(event) => setFormData({ ...formData, managerId: event.target.value })}>
                  <option value="">Nenhum</option>
                  {users
                    .filter((user) => user.id !== formData.id)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Departamento (Opcional)" description="Liga o colaborador a uma área da organização.">
                <Select value={formData.departmentId} onChange={(event) => setFormData({ ...formData, departmentId: event.target.value })}>
                  <option value="">Nenhum</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Função (Opcional)" description="Associa a função usada nos relatórios e listas operacionais.">
                <Select value={formData.roleId} onChange={(event) => setFormData({ ...formData, roleId: event.target.value })}>
                  <option value="">Nenhum</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Nível hierárquico (Opcional)" description="Associa o utilizador ao grau adequado na estrutura.">
                <Select value={formData.hierarchyLevelId} onChange={(event) => setFormData({ ...formData, hierarchyLevelId: event.target.value })}>
                  <option value="">Nenhum</option>
                  {hierarchyLevels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

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

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              As funções internas do sistema, como ADMIN, não estão expostas no contrato de API e não podem ser modificadas aqui.
            </p>
          </form>
        </FormPanel>
      )}
    </div>
  );
}