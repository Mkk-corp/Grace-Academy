-- AlterTable: add feedbackAr to AssessmentReport
ALTER TABLE "AssessmentReport" ADD COLUMN IF NOT EXISTS "feedbackAr" TEXT NOT NULL DEFAULT '';
