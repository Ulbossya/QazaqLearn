-- CreateTable
CREATE TABLE "ai_response_cache" (
    "id" UUID NOT NULL,
    "prompt_hash" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_response_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_response_cache_prompt_hash_key" ON "ai_response_cache"("prompt_hash");

-- CreateIndex
CREATE INDEX "ai_response_cache_expires_at_idx" ON "ai_response_cache"("expires_at");
