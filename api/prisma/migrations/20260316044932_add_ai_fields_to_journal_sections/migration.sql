-- AlterTable
ALTER TABLE "JournalSection" ADD COLUMN     "emotion_score" DOUBLE PRECISION,
ADD COLUMN     "primary_emotion" TEXT,
ADD COLUMN     "reflection_text" TEXT;
