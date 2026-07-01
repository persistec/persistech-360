-- AlterTable
ALTER TABLE "departments" ADD COLUMN "archived_at" TIMESTAMP(3),
ADD COLUMN "archived_by" TEXT,
ADD COLUMN "archive_reason" TEXT;

-- AlterTable
ALTER TABLE "hierarchy_levels" ADD COLUMN "archived_at" TIMESTAMP(3),
ADD COLUMN "archived_by" TEXT,
ADD COLUMN "archive_reason" TEXT;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN "archived_at" TIMESTAMP(3),
ADD COLUMN "archived_by" TEXT,
ADD COLUMN "archive_reason" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "archived_at" TIMESTAMP(3),
ADD COLUMN "archived_by" TEXT,
ADD COLUMN "archive_reason" TEXT;
