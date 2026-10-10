-- CreateTable
CREATE TABLE "QuickPreset" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'EXPENSE',
    "categoryId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "icon" TEXT NOT NULL DEFAULT 'zap',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuickPreset_userId_sortOrder_idx" ON "QuickPreset"("userId", "sortOrder");

-- AddForeignKey
ALTER TABLE "QuickPreset" ADD CONSTRAINT "QuickPreset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickPreset" ADD CONSTRAINT "QuickPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
