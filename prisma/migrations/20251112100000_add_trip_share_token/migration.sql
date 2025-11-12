-- CreateTable
CREATE TABLE "trip_share_tokens" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT 'view_only',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "trip_share_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trip_share_tokens_token_key" ON "trip_share_tokens"("token");

-- CreateIndex
CREATE INDEX "trip_share_tokens_trip_id_idx" ON "trip_share_tokens"("trip_id");

-- CreateIndex
CREATE INDEX "trip_share_tokens_token_idx" ON "trip_share_tokens"("token");

-- CreateIndex
CREATE INDEX "trip_share_tokens_expires_at_idx" ON "trip_share_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "trip_share_tokens" ADD CONSTRAINT "trip_share_tokens_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_share_tokens" ADD CONSTRAINT "trip_share_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
