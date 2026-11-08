CREATE TABLE "AiPracticeDailyUsage" (
    "userId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "aiQuestionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "localQuestionsGenerated" INTEGER NOT NULL DEFAULT 0,
    "aiQuestionsReserved" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPracticeDailyUsage_pkey" PRIMARY KEY ("userId", "dayKey")
);

CREATE TABLE "AiPracticeGeneration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "fingerprint" TEXT NOT NULL,
    "problemData" JSONB,
    "responseData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiPracticeGeneration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AiPracticeGeneration_userId_requestId_key"
ON "AiPracticeGeneration"("userId", "requestId");
CREATE INDEX "AiPracticeDailyUsage_dayKey_idx"
ON "AiPracticeDailyUsage"("dayKey");
CREATE INDEX "AiPracticeGeneration_userId_dayKey_createdAt_idx"
ON "AiPracticeGeneration"("userId", "dayKey", "createdAt");
CREATE INDEX "AiPracticeGeneration_userId_dayKey_fingerprint_idx"
ON "AiPracticeGeneration"("userId", "dayKey", "fingerprint");
CREATE INDEX "AiPracticeGeneration_status_createdAt_idx"
ON "AiPracticeGeneration"("status", "createdAt");

ALTER TABLE "AiPracticeDailyUsage"
ADD CONSTRAINT "AiPracticeDailyUsage_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiPracticeGeneration"
ADD CONSTRAINT "AiPracticeGeneration_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiPracticeGeneration"
ADD CONSTRAINT "AiPracticeGeneration_userId_dayKey_fkey"
FOREIGN KEY ("userId", "dayKey") REFERENCES "AiPracticeDailyUsage"("userId", "dayKey")
ON DELETE CASCADE ON UPDATE CASCADE;
