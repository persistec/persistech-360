-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('draft', 'scheduled', 'open', 'closing_soon', 'closed', 'results_published', 'archived');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('pending', 'completed', 'locked', 'cancelled');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('same_department_peer', 'cross_department_peer', 'manager_to_subordinate', 'manual_assignment');

-- CreateTable
CREATE TABLE "cycles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'draft',
    "retention_policy_id" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_assignments" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "evaluator_id" TEXT NOT NULL,
    "evaluatee_id" TEXT NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'pending',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_assignments_cycle_id_evaluator_id_evaluatee_id_key" ON "evaluation_assignments"("cycle_id", "evaluator_id", "evaluatee_id");

-- AddForeignKey
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_retention_policy_id_fkey" FOREIGN KEY ("retention_policy_id") REFERENCES "retention_policies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycles" ADD CONSTRAINT "cycles_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_assignments" ADD CONSTRAINT "evaluation_assignments_evaluatee_id_fkey" FOREIGN KEY ("evaluatee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
