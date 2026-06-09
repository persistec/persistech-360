-- CreateEnum
CREATE TYPE "DimensionType" AS ENUM ('corporate', 'departmental', 'leadership');

-- CreateTable
CREATE TABLE "dimensions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DimensionType" NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dimensions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criteria" (
    "id" TEXT NOT NULL,
    "dimension_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterion_options" (
    "id" TEXT NOT NULL,
    "criterion_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "score_value" DOUBLE PRECISION,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "criterion_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicability_rules" (
    "id" TEXT NOT NULL,
    "dimension_id" TEXT,
    "criterion_id" TEXT,
    "relationship_type" TEXT,
    "same_department_required" BOOLEAN NOT NULL DEFAULT false,
    "cross_department_allowed" BOOLEAN NOT NULL DEFAULT true,
    "min_hierarchy_rank" INTEGER,
    "max_hierarchy_rank" INTEGER,
    "required_role_family" TEXT,
    "blocked_if_evaluatee_above_evaluator" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_rules" (
    "id" TEXT NOT NULL,
    "relationship_type" TEXT NOT NULL,
    "same_department_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "cross_department_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "category_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weight_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "evaluations_visible_until_offset" INTEGER NOT NULL,
    "exports_allowed_until_offset" INTEGER NOT NULL,
    "raw_data_retention_until_offset" INTEGER NOT NULL,
    "anonymized_summary_retention_until_offset" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dimensions_name_key" ON "dimensions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "retention_policies_name_key" ON "retention_policies"("name");

-- AddForeignKey
ALTER TABLE "criteria" ADD CONSTRAINT "criteria_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_options" ADD CONSTRAINT "criterion_options_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicability_rules" ADD CONSTRAINT "applicability_rules_dimension_id_fkey" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicability_rules" ADD CONSTRAINT "applicability_rules_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
