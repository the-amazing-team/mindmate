/*
  Warnings:

  - The values [OPENNESS,CONSCIENTIOUSNESS,EXTRAVERSION,AGREEABLENESS,NEUROTICISM] on the enum `PersonalityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PersonalityType_new" AS ENUM ('INTROVERT', 'EXTROVERT', 'AMBIVERT');
ALTER TABLE "User" ALTER COLUMN "personality_type" TYPE "PersonalityType_new" USING ("personality_type"::text::"PersonalityType_new");
ALTER TYPE "PersonalityType" RENAME TO "PersonalityType_old";
ALTER TYPE "PersonalityType_new" RENAME TO "PersonalityType";
DROP TYPE "public"."PersonalityType_old";
COMMIT;
