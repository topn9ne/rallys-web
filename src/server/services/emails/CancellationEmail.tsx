import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface CancellationEmailProps {
  name: string;
  lane: string;
  sessionDate: string;
  sessionTime: string;
  refundAmount?: string;
  reason?: string;
}

export function CancellationEmail({
  name,
  lane,
  sessionDate,
  sessionTime,
  refundAmount,
  reason,
}: CancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Rally&apos;s session has been cancelled.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Rally&apos;s Indoor Training</Heading>
            <Text style={headerTagline}>Hastings, NE</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Session Cancelled
            </Heading>
            <Text style={text}>Hi {name},</Text>
            <Text style={text}>
              Your session on <strong>{lane}</strong> scheduled for {sessionDate}{" "}
              at {sessionTime} has been cancelled.
              {reason ? ` Reason: ${reason}` : ""}
            </Text>
            {refundAmount && (
              <>
                <Hr style={hr} />
                <Text style={{ ...text, color: "#16a34a" }}>
                  A refund of <strong>{refundAmount}</strong> has been processed
                  and should appear on your statement within 5–10 business days.
                </Text>
              </>
            )}
            <Hr style={hr} />
            <Text style={text}>
              You can book a new session any time at rallysindoortraining.com.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Rally&apos;s Indoor Training &middot; Hastings, NE
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f4f4f5", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" };
const container = { margin: "0 auto", maxWidth: "580px", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" };
const header = { backgroundColor: "#2B5CE6", padding: "32px 40px" };
const headerTitle = { color: "#ffffff", fontSize: "24px", fontWeight: "700", margin: "0" };
const headerTagline = { color: "#93c5fd", fontSize: "14px", margin: "4px 0 0" };
const content = { padding: "32px 40px" };
const h2 = { fontSize: "20px", color: "#111827", fontWeight: "700", margin: "0 0 16px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
