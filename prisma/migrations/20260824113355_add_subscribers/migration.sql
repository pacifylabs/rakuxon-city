-- CreateTable
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source_path" TEXT NOT NULL,
    "consent_given_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "confirmation_token" TEXT NOT NULL,
    "unsubscribe_token" TEXT NOT NULL,
    "synced_to_resend_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_confirmation_token_key" ON "subscribers"("confirmation_token");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_unsubscribe_token_key" ON "subscribers"("unsubscribe_token");

-- CreateIndex
CREATE INDEX "subscribers_confirmed_at_idx" ON "subscribers"("confirmed_at");

-- CreateIndex
CREATE INDEX "subscribers_synced_to_resend_at_idx" ON "subscribers"("synced_to_resend_at");
