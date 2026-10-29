import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface BookingConfirmationEmailProps {
  name: string;
  lane: string;
  sessionDate: string;
  sessionTime: string;
  doorCode: string;
  totalPaid: string;
  bookingId: string;
  waiverUrl: string;
  appUrl: string;
}

export function BookingConfirmationEmail({
  name,
  lane,
  sessionDate,
  sessionTime,
  doorCode,
  totalPaid,
  bookingId,
  waiverUrl,
  appUrl,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Rally&apos;s session is confirmed! Your door code: {doorCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Rally&apos;s Indoor Training</Heading>
            <Text style={headerTagline}>Hastings, NE</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              You&apos;re booked, {name}!
            </Heading>
            <Text style={text}>
              Your cage session is confirmed. Here are your details:
            </Text>

            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Lane</Text>
                <Text style={detailValue}>{lane}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{sessionDate}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Time</Text>
                <Text style={detailValue}>{sessionTime}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Total Paid</Text>
                <Text style={{ ...detailValue, color: "#2B5CE6", fontWeight: "700" }}>
                  {totalPaid}
                </Text>
              </Row>
            </Section>

            <Section style={codeBox}>
              <Text style={codeLabel}>Your Door Code</Text>
              <Text style={codeValue}>{doorCode}</Text>
              <Text style={codeHint}>
                Active 15 min before your session &mdash; expires 15 min after.
              </Text>
            </Section>

            <Hr style={hr} />

            <Section style={waiverSection}>
              <Heading as="h3" style={h3}>
                Action Required: Sign Your Waiver
              </Heading>
              <Text style={text}>
                You must sign the liability waiver before your session.
                Click below to complete it — takes 30 seconds.
              </Text>
              <Button href={waiverUrl} style={ctaButton}>
                Sign Waiver Now
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={smallText}>
              Booking ID: {bookingId}
            </Text>
            <Text style={smallText}>
              Questions? Reply to this email or visit {appUrl}
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Rally&apos;s Indoor Training &middot; Hastings, NE
            </Text>
            <Text style={footerText}>
              You&apos;re receiving this because you booked a cage session.
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
const h2 = { fontSize: "22px", color: "#111827", fontWeight: "700", margin: "0 0 12px" };
const h3 = { fontSize: "16px", color: "#111827", fontWeight: "700", margin: "0 0 8px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 16px" };
const smallText = { fontSize: "12px", color: "#9ca3af", margin: "4px 0" };
const detailsBox = { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" };
const detailLabel = { fontSize: "12px", color: "#6b7280", margin: "4px 0 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const detailValue = { fontSize: "15px", color: "#111827", margin: "0 0 12px", fontWeight: "500" };
const codeBox = { backgroundColor: "#eef2ff", borderRadius: "8px", padding: "24px", marginBottom: "24px", textAlign: "center" as const, border: "2px dashed #4a7bff" };
const codeLabel = { fontSize: "11px", color: "#6b7280", margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: "0.1em" };
const codeValue = { fontSize: "36px", color: "#2B5CE6", fontWeight: "800", margin: "0", letterSpacing: "6px", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" };
const codeHint = { fontSize: "12px", color: "#6b7280", margin: "8px 0 0" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const waiverSection = { backgroundColor: "#fffbeb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px", border: "1px solid #fcd34d" };
const ctaButton = { backgroundColor: "#E8722A", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
