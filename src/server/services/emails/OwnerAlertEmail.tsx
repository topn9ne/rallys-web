import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface OwnerAlertEmailProps {
  eventType: "confirmed" | "cancelled";
  customerName: string;
  customerEmail: string;
  rideName: string;
  rideDate: string;
  rideTime: string;
  bookingId: string;
  totalPaid: string;
  refundAmount?: string;
  reason?: string;
  adminBookingUrl: string;
}

export function OwnerAlertEmail({
  eventType,
  customerName,
  customerEmail,
  rideName,
  rideDate,
  rideTime,
  bookingId,
  totalPaid,
  refundAmount,
  reason,
  adminBookingUrl,
}: OwnerAlertEmailProps) {
  const isConfirmed = eventType === "confirmed";

  return (
    <Html>
      <Head />
      <Preview>
        {isConfirmed
          ? `New booking: ${customerName} — ${rideName} on ${rideDate}`
          : `Booking cancelled: ${customerName} — ${rideName} on ${rideDate}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>Railside Rides</Heading>
            <Text style={headerTagline}>Owner Alert</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              {isConfirmed ? "New Booking Confirmed" : "Booking Cancelled"}
            </Heading>

            {/* Details box */}
            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Customer</Text>
                <Text style={detailValue}>{customerName}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Email</Text>
                <Text style={detailValue}>{customerEmail}</Text>
              </Row>
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
                <Text style={detailLabel}>Total Paid</Text>
                <Text style={{ ...detailValue, color: "#2B5CE6", fontWeight: "700" }}>
                  {totalPaid}
                </Text>
              </Row>
              {refundAmount && (
                <Row>
                  <Text style={detailLabel}>Refund</Text>
                  <Text style={{ ...detailValue, color: "#dc2626" }}>{refundAmount}</Text>
                </Row>
              )}
              {reason && (
                <Row>
                  <Text style={detailLabel}>Reason</Text>
                  <Text style={detailValue}>{reason}</Text>
                </Row>
              )}
            </Section>

            <Button href={adminBookingUrl} style={ctaButton}>
              View Booking
            </Button>

            <Text style={smallText}>Booking ID: {bookingId}</Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>Railside Rides · Grand Island, NE</Text>
            <Text style={footerText}>
              You're receiving this because you are an admin for Railside Rides.
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
const h2 = { fontSize: "22px", color: "#111827", fontWeight: "700", margin: "0 0 16px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 16px" };
const smallText = { fontSize: "12px", color: "#9ca3af", margin: "16px 0 0" };
const detailsBox = { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" };
const detailLabel = { fontSize: "12px", color: "#6b7280", margin: "4px 0 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const detailValue = { fontSize: "15px", color: "#111827", margin: "0 0 12px", fontWeight: "500" };
const ctaButton = { backgroundColor: "#2B5CE6", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
