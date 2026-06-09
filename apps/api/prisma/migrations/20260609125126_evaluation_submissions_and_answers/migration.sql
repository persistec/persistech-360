-- CreateTable
CREATE TABLE "evaluation_submissions" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "final_comment" TEXT,
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_answers" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "criterion_option_id" TEXT,
    "score_value_snapshot" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_submissions_assignment_id_key" ON "evaluation_submissions"("assignment_id");

-- CreateIndex
CREATE INDEX "evaluation_answers_criterion_id_idx" ON "evaluation_answers"("criterion_id");

-- CreateIndex
CREATE INDEX "evaluation_answers_criterion_option_id_idx" ON "evaluation_answers"("criterion_option_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_answers_submission_id_criterion_id_key" ON "evaluation_answers"("submission_id", "criterion_id");

-- AddForeignKey
ALTER TABLE "evaluation_submissions" ADD CONSTRAINT "evaluation_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "evaluation_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_answers" ADD CONSTRAINT "evaluation_answers_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "evaluation_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_answers" ADD CONSTRAINT "evaluation_answers_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_answers" ADD CONSTRAINT "evaluation_answers_criterion_option_id_fkey" FOREIGN KEY ("criterion_option_id") REFERENCES "criterion_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
