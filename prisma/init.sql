CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "occurredAt" DATETIME NOT NULL,
  "type" TEXT NOT NULL,
  "sourceText" TEXT,
  "confidence" REAL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "Transaction_occurredAt_idx" ON "Transaction"("occurredAt");
CREATE INDEX IF NOT EXISTS "Transaction_category_idx" ON "Transaction"("category");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"("type");

CREATE TABLE IF NOT EXISTS "Settings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "monthlyBudget" INTEGER NOT NULL DEFAULT 80000,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "theme" TEXT NOT NULL DEFAULT 'system',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Correction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "transactionId" TEXT,
  "sourceText" TEXT,
  "originalAmount" INTEGER,
  "correctedAmount" INTEGER,
  "originalCategory" TEXT,
  "correctedCategory" TEXT,
  "originalDescription" TEXT,
  "correctedDescription" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
