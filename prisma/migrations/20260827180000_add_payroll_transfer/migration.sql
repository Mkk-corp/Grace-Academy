-- CreateTable: PayrollTransfer
CREATE TABLE IF NOT EXISTS "PayrollTransfer" (
  "id"               TEXT NOT NULL,
  "assessorId"       TEXT NOT NULL,
  "assessorName"     TEXT NOT NULL,
  "assessorEmail"    TEXT NOT NULL,
  "month"            TEXT NOT NULL,
  "placementCount"   INTEGER NOT NULL DEFAULT 0,
  "speakingCount"    INTEGER NOT NULL DEFAULT 0,
  "placementRate"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "speakingRate"     DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalAmount"      DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency"         TEXT NOT NULL DEFAULT 'USD',
  "paymentMethod"    TEXT NOT NULL,
  "evidenceData"     TEXT,
  "evidenceName"     TEXT,
  "transferredById"  TEXT NOT NULL,
  "transferredByName" TEXT NOT NULL,
  "transferredAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PayrollTransfer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PayrollTransfer_assessorId_idx" ON "PayrollTransfer"("assessorId");
CREATE INDEX IF NOT EXISTS "PayrollTransfer_month_idx"      ON "PayrollTransfer"("month");
