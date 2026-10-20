function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: required("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),
  DATABASE_URL: required("DATABASE_URL"),

  STRIPE_SECRET_KEY: required("STRIPE_SECRET_KEY"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: required("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  STRIPE_WEBHOOK_SECRET: required("STRIPE_WEBHOOK_SECRET"),
  STRIPE_TAX_RATE_ID: optional("STRIPE_TAX_RATE_ID"),
  STRIPE_MEMBER_PRICE_ID: required("STRIPE_MEMBER_PRICE_ID"),
  STRIPE_TEAM_PRICE_ID: required("STRIPE_TEAM_PRICE_ID"),
  STRIPE_FAMILY_ANNUAL_PRICE_ID: optional("STRIPE_FAMILY_ANNUAL_PRICE_ID"),
  STRIPE_TEAM_ANNUAL_PRICE_ID: optional("STRIPE_TEAM_ANNUAL_PRICE_ID"),

  TWILIO_ACCOUNT_SID: required("TWILIO_ACCOUNT_SID"),
  TWILIO_AUTH_TOKEN: required("TWILIO_AUTH_TOKEN"),
  TWILIO_FROM: required("TWILIO_FROM"),

  SEAM_API_KEY: required("SEAM_API_KEY"),
  SEAM_DEVICE_ID: required("SEAM_DEVICE_ID"),

  RESEND_API_KEY: required("RESEND_API_KEY"),

  NEXT_PUBLIC_APP_URL: required("NEXT_PUBLIC_APP_URL"),
  CRON_SECRET: required("CRON_SECRET"),
} as const;
