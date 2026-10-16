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

interface RideReminderEmailProps {
  customerName: string;
  rideName: string;
  rideDate: string;
  rideTime: string;
  pickupLocation: string;
  pickupAddress: string;
  waiverSigned: boolean;
  waiverUrl: string;
}

export function RideReminderEmail({
  customerName,
  rideName,
  rideDate,
  rideTime,
  pickupLocation,
  pickupAddress,
  waiverSigned,
  waiverUrl,
}: RideReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Railside Ride is tomorrow! {!waiverSigned ? "⚠️ Waiver still needed." : "See you there!"}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Railside Rides</Heading>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>
              Your ride is tomorrow, {customerName}!
            </Heading>

            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Ride</Text>
                <Text style={detailValue}>{rideName}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Date & Time</Text>
                <Text style={detailValue}>{rideDate} at {rideTime}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Pick-up Location</Text>
                <Text style={detailValue}>{pickupLocation}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Address</Text>
                <Text style={{ ...detailValue, margin: 0 }}>{pickupAddress}</Text>
              </Row>
            </Section>

            {!waiverSigned && (
              <>
                <Hr style={hr} />
                <Section style={urgentBox}>
                  <Text style={{ ...text, fontWeight: "700", margin: "0 0 8px" }}>
                    ⚠️ Waiver Not Yet Signed
                  </Text>
                  <Text style={{ ...text, margin: "0 0 16px" }}>
                    You must sign the liability waiver before your ride begins or
                    you won't be able to board.
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
                  ✅ Waiver signed — you're all set! See you tomorrow.
                </Text>
              </>
            )}
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
const h2 = { fontSize: "20px", color: "#111827", fontWeight: "700", margin: "0 0 20px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" };
const detailsBox = { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" };
const detailLabel = { fontSize: "11px", color: "#6b7280", margin: "4px 0 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const detailValue = { fontSize: "15px", color: "#111827", margin: "0 0 12px", fontWeight: "500" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const urgentBox = { backgroundColor: "#fff7ed", borderRadius: "8px", padding: "20px 24px", border: "1px solid #fed7aa" };
const ctaButton = { backgroundColor: "#E8722A", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "16px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
