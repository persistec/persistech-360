"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { Alert, EmptyState, LoadingSpinner, MetricCard, PageHeader, PageSection, StatusBadge, Table, TableCell, TableRow } from "@/components/ui";

interface Submission {
  id: string;
  assignmentId: string;
  status: string;
  submittedAt: string | null;
  createdAt: string;
}

const submissionStatusLabels: Record<string, string> = {
  SUBMITTED: "Submetida",
  DRAFT: "Rascunho",
  PENDING: "Pendente",
};

const submissionStatusTone = (status: string) => (status === "SUBMITTED" ? "success" : status === "DRAFT" ? "neutral" : "warning");

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ data: Submission[] }>("/evaluation-submissions");
      setSubmissions(response.data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao obter submissões.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter((submission) => submission.status === "SUBMITTED").length;
  const draftCount = submissions.filter((submission) => submission.status === "DRAFT").length;
  const pendingCount = submissions.filter((submission) => submission.status === "PENDING").length;

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Submissões"
        description="Ver o estado das submissões de avaliação. A edição de respostas não está disponível no portal administrativo."
      />

      <Alert variant="info" className="mb-6">
        As respostas são tratadas conforme as regras de confidencialidade definidas para o ciclo.
      </Alert>

      <PageSection title="Resumo" description="Leitura rápida do estado actual das submissões registadas.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total" value={totalSubmissions} description="Submissões registadas no sistema." />
          <MetricCard label="Submetidas" value={submittedCount} description="Respostas já entregues ao ciclo." />
          <MetricCard label="Rascunhos" value={draftCount} description="Respostas guardadas sem envio final." />
          <MetricCard label="Pendentes" value={pendingCount} description="Respostas que ainda aguardam conclusão." />
        </div>
      </PageSection>

      <div className="mt-8">
        <Table headers={["ID da submissão", "ID da atribuição", "Estado", "Data de submissão", "Data de criação"]}>
          {submissions.length === 0 ? (
            <EmptyState
              colSpan={5}
              title="Ainda não existem submissões"
              description="Assim que os avaliadores submeterem respostas, os registos aparecem aqui para consulta."
            />
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-mono text-xs">{submission.id}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{submission.assignmentId}</TableCell>
                <TableCell>
                  <StatusBadge tone={submissionStatusTone(submission.status)}>{submissionStatusLabels[submission.status] || submission.status}</StatusBadge>
                </TableCell>
                <TableCell>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("pt-AO") : "-"}</TableCell>
                <TableCell>{new Date(submission.createdAt).toLocaleString("pt-AO")}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
      </div>

      {error ? <Alert className="mt-6">{error}</Alert> : null}
    </div>
  );
}
