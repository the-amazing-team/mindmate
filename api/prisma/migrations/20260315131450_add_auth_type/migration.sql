-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('GOOGLE', 'EMAIL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth_type" "AuthType" NOT NULL DEFAULT 'EMAIL',
ALTER COLUMN "password_hash" DROP NOT NULL;
