CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS');
CREATE TYPE "NotificationAudience" AS ENUM ('CUSTOMER', 'OWNER');

CREATE TABLE "notification_configs" (
  "id"        TEXT                    NOT NULL,
  "trigger"   TEXT                    NOT NULL,
  "channel"   "NotificationChannel"   NOT NULL,
  "audience"  "NotificationAudience"  NOT NULL,
  "enabled"   BOOLEAN                 NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3)            NOT NULL,
  CONSTRAINT "notification_configs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_configs_trigger_channel_audience_key"
    UNIQUE ("trigger", "channel", "audience")
);
