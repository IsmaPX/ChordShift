-- Migración: añadir tabla leaderboard_snapshot_cache para cache pre-calculado.
-- Esta tabla es el equivalente a una "materialized view" pero portable
-- y actualizable por un job. Contiene snapshots con TTL.

-- CreateTable
CREATE TABLE "leaderboard_snapshot_cache" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "total_users" INTEGER NOT NULL,

    CONSTRAINT "leaderboard_snapshot_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_snapshot_cache_category_period_key" ON "leaderboard_snapshot_cache"("category", "period");

-- CreateIndex
CREATE INDEX "leaderboard_snapshot_cache_expires_at_idx" ON "leaderboard_snapshot_cache"("expires_at");
