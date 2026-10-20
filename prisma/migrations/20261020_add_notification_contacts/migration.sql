-- CreateTable
CREATE TABLE "notification_contacts" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "relationship" TEXT NOT NULL,
    "sendCodes" BOOLEAN NOT NULL DEFAULT true,
    "sendBookings" BOOLEAN NOT NULL DEFAULT true,
    "sendBilling" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification_contacts" ADD CONSTRAINT "notification_contacts_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
