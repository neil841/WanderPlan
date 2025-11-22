-- AlterTable
ALTER TABLE "proposals"
  DROP COLUMN "total_price",
  ADD COLUMN "line_items" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "terms" TEXT,
  ADD COLUMN "accepted_at" TIMESTAMP(3),
  ADD COLUMN "rejected_at" TIMESTAMP(3),
  ADD COLUMN "deleted_at" TIMESTAMP(3),
  ALTER COLUMN "currency" SET DEFAULT 'USD';

-- DropTable
DROP TABLE IF EXISTS "proposal_line_items";
