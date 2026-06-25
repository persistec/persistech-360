"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api-client";
import { Alert, EmptyState, LoadingSpinner, PageHeader, StatusBadge, Table, TableCell, TableRow } from "@/components/ui";

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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Submissões"
        description="Ver o estado das submissões de avaliação. A edição de respostas não está disponível no portal administrativo."
      />

      {error ? <Alert className="mb-6">{error}</Alert> : null}

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
  );
}