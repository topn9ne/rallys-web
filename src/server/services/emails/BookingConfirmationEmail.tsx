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
  customerName: string;
  rideName: string;
  rideDate: string;
  rideTime: string;
  pickupLocation: string;
  totalPaid: string;
  bookingId: string;
  waiverUrl: string;
  appUrl: string;
}

export function BookingConfirmationEmail({
  customerName,
  rideName,
  rideDate,
  rideTime,
  pickupLocation,
  totalPaid,
  bookingId,
  waiverUrl,
  appUrl,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Railside Rides booking is confirmed! Sign your waiver to complete check-in.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Railside Rides</Heading>
            <Text style={headerTagline}>#RailsideGetsRowdy</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              You're booked, {customerName}! 🎉
            </Heading>
            <Text style={text}>
              Your reservation is confirmed. Here are your ride details:
            </Text>

            {/* Booking details box */}
            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Ride</Text>
                <Text style={detailValue}>{rideName}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{rideDate}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Time</Text>
                <Text style={detailValue}>{rideTime}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Pick-up</Text>
                <Text style={detailValue}>{pickupLocation}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Total Paid</Text>
                <Text style={{ ...detailValue, color: "#2B5CE6", fontWeight: "700" }}>
                  {totalPaid}
                </Text>
              </Row>
            </Section>

            <Hr style={hr} />

            {/* Waiver CTA */}
            <Section style={waiverSection}>
              <Heading as="h3" style={h3}>
                ⚠️ Action Required: Sign Your Waiver
              </Heading>
              <Text style={text}>
                You must sign the liability waiver before your ride begins.
                Click the button below to complete it now — it only takes 30 seconds.
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

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Railside Rides · Grand Island, NE
            </Text>
            <Text style={footerText}>
              You're receiving this because you booked a ride with us.
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
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const waiverSection = { backgroundColor: "#fffbeb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px", border: "1px solid #fcd34d" };
const ctaButton = { backgroundColor: "#E8722A", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
