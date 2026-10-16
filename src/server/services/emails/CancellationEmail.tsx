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
  customerName: string;
  rideName: string;
  rideDate: string;
  rideTime: string;
  refundAmount?: string;
  reason?: string;
}

export function CancellationEmail({
  customerName,
  rideName,
  rideDate,
  rideTime,
  refundAmount,
  reason,
}: CancellationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Railside Rides booking has been cancelled.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Railside Rides</Heading>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Booking Cancelled
            </Heading>
            <Text style={text}>Hi {customerName},</Text>
            <Text style={text}>
              Your booking for <strong>{rideName}</strong> on {rideDate} at{" "}
              {rideTime} has been cancelled.
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
              We hope to see you on the bike trail soon!
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>Railside Rides · Grand Island, NE</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f4f4f5", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" };
const container = { margin: "0 auto", maxWidth: "580px", backgroundColor: "#ffffff", borderRadius: "12px", overflow: "hidden" };
const header = { backgroundColor: "#2B5CE6", padding: "24px 40px" };
const headerTitle = { color: "#ffffff", fontSize: "20px", fontWeight: "700", margin: "0" };
const content = { padding: "32px 40px" };
const h2 = { fontSize: "20px", color: "#111827", fontWeight: "700", margin: "0 0 16px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" };
const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const footer = { backgroundColor: "#f9fafb", padding: "16px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "0" };
