import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_FROM
  ) {
    throw new Error("Twilio environment variables are not fully set");
  }
  if (!_client) {
    _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _client;
}

export const twilioClient = new Proxy({} as ReturnType<typeof twilio>, {
  get(_target, prop) {
    return (getTwilioClient() as any)[prop];
  },
});

export function getTwilioFrom(): string {
  if (!process.env.TWILIO_FROM) {
    throw new Error("TWILIO_FROM is not set");
  }
  return process.env.TWILIO_FROM;
}

export const TWILIO_FROM = new Proxy({ value: "" } as any, {
  get() {
    return getTwilioFrom();
  },
});
