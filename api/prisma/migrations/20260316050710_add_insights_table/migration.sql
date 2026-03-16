-- CreateTable
CREATE TABLE "Insight" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "journal_entry_id" UUID,
    "summary" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "patterns" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Insight_user_id_idx" ON "Insight"("user_id");

-- CreateIndex
CREATE INDEX "Insight_journal_entry_id_idx" ON "Insight"("journal_entry_id");

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insight" ADD CONSTRAINT "Insight_journal_entry_id_fkey" FOREIGN KEY ("journal_entry_id") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
