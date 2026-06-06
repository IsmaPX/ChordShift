-- Migración: añadir tabla live_sessions para sesiones en vivo (WebSockets).
-- Se ejecuta DESPUÉS de las migraciones iniciales (fase 1-3).

-- CreateTable
CREATE TABLE "live_sessions" (
    "id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "current_beat" INTEGER NOT NULL DEFAULT 0,
    "bpm" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "live_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "live_sessions_host_id_idx" ON "live_sessions"("host_id");

-- CreateIndex
CREATE INDEX "live_sessions_song_id_idx" ON "live_sessions"("song_id");

-- CreateIndex
CREATE INDEX "live_sessions_status_idx" ON "live_sessions"("status");

-- CreateIndex
CREATE INDEX "live_sessions_started_at_idx" ON "live_sessions"("started_at");

-- AddForeignKey
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
