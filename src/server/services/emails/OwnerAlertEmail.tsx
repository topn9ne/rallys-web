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
  name: string;
  email: string;
  phone: string;
  lane: string;
  sessionDate: string;
  sessionTime: string;
  bookingId: string;
  totalPaid: string;
  refundAmount?: string;
  reason?: string;
  adminBookingUrl: string;
}

export function OwnerAlertEmail({
  eventType,
  name,
  email,
  phone,
  lane,
  sessionDate,
  sessionTime,
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
          ? `New booking: ${name} — ${lane} on ${sessionDate}`
          : `Booking cancelled: ${name} — ${lane} on ${sessionDate}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Rally&apos;s Indoor Training</Heading>
            <Text style={headerTagline}>Owner Alert</Text>
          </Section>

          <Section style={content}>
            <Heading as="h2" style={h2}>
              {isConfirmed ? "New Booking Confirmed" : "Booking Cancelled"}
            </Heading>

            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Name</Text>
                <Text style={detailValue}>{name}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Email</Text>
                <Text style={detailValue}>{email}</Text>
              </Row>
              <Row>
                <Text style={detailLabel}>Phone</Text>
                <Text style={detailValue}>{phone}</Text>
              </Row>
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

          <Section style={footer}>
            <Text style={footerText}>
              Rally&apos;s Indoor Training &middot; Hastings, NE
            </Text>
            <Text style={footerText}>
              You&apos;re receiving this because you are an admin for Rally&apos;s Indoor Training.
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
const smallText = { fontSize: "12px", color: "#9ca3af", margin: "16px 0 0" };
const detailsBox = { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" };
const detailLabel = { fontSize: "12px", color: "#6b7280", margin: "4px 0 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const detailValue = { fontSize: "15px", color: "#111827", margin: "0 0 12px", fontWeight: "500" };
const ctaButton = { backgroundColor: "#2B5CE6", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 24px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
