-- CreateTable
CREATE TABLE "SalonSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salonId" TEXT NOT NULL,
    "notifyPromos" BOOLEAN NOT NULL DEFAULT true,
    "notifyStories" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalonSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalonSubscription_userId_idx" ON "SalonSubscription"("userId");

-- CreateIndex
CREATE INDEX "SalonSubscription_salonId_idx" ON "SalonSubscription"("salonId");

-- CreateIndex
CREATE UNIQUE INDEX "SalonSubscription_userId_salonId_key" ON "SalonSubscription"("userId", "salonId");

-- AddForeignKey
ALTER TABLE "SalonSubscription" ADD CONSTRAINT "SalonSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalonSubscription" ADD CONSTRAINT "SalonSubscription_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
