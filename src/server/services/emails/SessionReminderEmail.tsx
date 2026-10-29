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

interface SessionReminderEmailProps {
  name: string;
  lane: string;
  sessionDate: string;
  sessionTime: string;
  doorCode: string;
  waiverSigned: boolean;
  waiverUrl: string;
}

export function SessionReminderEmail({
  name,
  lane,
  sessionDate,
  sessionTime,
  doorCode,
  waiverSigned,
  waiverUrl,
}: SessionReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Rally&apos;s session is tomorrow! {!waiverSigned ? "Waiver still needed." : "See you there!"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Rally&apos;s Indoor Training</Heading>
            <Text style={headerTagline}>Hastings, NE</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Your session is tomorrow, {name}!
            </Heading>

            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Lane</Text>
                <Text style={detailValue}>{lane}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Date &amp; Time</Text>
                <Text style={detailValue}>{sessionDate} at {sessionTime}</Text>
              </Row>
            </Section>

            <Section style={codeBox}>
              <Text style={codeLabel}>Your Door Code</Text>
              <Text style={codeValue}>{doorCode}</Text>
              <Text style={codeHint}>
                Active 15 min before your session &mdash; expires 15 min after.
              </Text>
            </Section>

            {!waiverSigned && (
              <>
                <Hr style={hr} />
                <Section style={urgentBox}>
                  <Text style={{ ...text, fontWeight: "700", margin: "0 0 8px" }}>
                    Waiver Not Yet Signed
                  </Text>
                  <Text style={{ ...text, margin: "0 0 16px" }}>
                    You must sign the liability waiver before your session
                    or you won&apos;t be able to enter the facility.
                  </Text>
                  <Button href={waiverUrl} style={ctaButton}>
                    Sign Waiver Now
                  </Button>
                </Section>
              </>
            )}

            {waiverSigned && (
              <>
                <Hr style={hr} />
                <Text style={{ ...text, color: "#16a34a" }}>
                  Waiver signed — you&apos;re all set! See you tomorrow.
                </Text>
              </>
            )}
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
const h2 = { fontSize: "20px", color: "#111827", fontWeight: "700", margin: "0 0 20px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" };
const detailsBox = { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" };
const detailLabel = { fontSize: "11px", color: "#6b7280", margin: "4px 0 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const detailValue = { fontSize: "15px", color: "#111827", margin: "0 0 12px", fontWeight: "500" };
const codeBox = { backgroundColor: "#eef2ff", borderRadius: "8px", padding: "24px", marginBottom: "24px", textAlign: "center" as const, border: "2px dashed #4a7bff" };
const codeLabel = { fontSize: "11px", color: "#6b7280", margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: "0.1em" };
const codeValue = { fontSize: "36px", color: "#2B5CE6", fontWeight: "800", margin: "0", letterSpacing: "6px", fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace" };
const codeHint = { fontSize: "12px", color: "#6b7280", margin: "8px 0 0" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const urgentBox = { backgroundColor: "#fff7ed", borderRadius: "8px", padding: "20px 24px", border: "1px solid #fed7aa" };
const ctaButton = { backgroundColor: "#E8722A", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "16px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
