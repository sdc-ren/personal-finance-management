-- Bổ sung enum PaymentMethod và các cột Transaction còn thiếu trong chuỗi
-- migration gốc. Migration này đứng trước 20261010121500_add_quick_preset
-- (vì migration đó tham chiếu tới kiểu "PaymentMethod").
-- Viết theo dạng idempotent để an toàn với các DB đã fix thủ công.

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "transferCode" TEXT;
