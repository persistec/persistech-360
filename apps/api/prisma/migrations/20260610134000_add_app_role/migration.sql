-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('ADMIN', 'EMPLOYEE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "app_role" "AppRole" NOT NULL DEFAULT 'EMPLOYEE';
