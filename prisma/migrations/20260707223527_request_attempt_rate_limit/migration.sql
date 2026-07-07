-- CreateTable
CREATE TABLE "RequestAttempt" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequestAttempt_scope_ip_createdAt_idx" ON "RequestAttempt"("scope", "ip", "createdAt");
