import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text, Row,
} from "@react-email/components";

interface ShiftOpenEmailProps {
  staffName: string;
  rideLabel: string;
  rideDate: string;
  rideTime: string;
  bike: string;
  interestUrl: string;
}

export function ShiftOpenEmail({ staffName, rideLabel, rideDate, rideTime, bike, interestUrl }: ShiftOpenEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A shift is open — {rideLabel} on {rideDate}. Let us know if you're available.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Railside Rides</Heading>
            <Text style={headerTagline}>Shift Opening</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>Hey {staffName}, a shift is open!</Heading>
            <Text style={text}>
              A ride needs staffing. If you're available, click the button below to raise your hand — the owner will confirm assignments.
            </Text>
            <Section style={detailsBox}>
              <Row>
                <Text style={detailLabel}>Ride</Text>
                <Text style={detailValue}>{rideLabel}</Text>
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
                <Text style={detailLabel}>Bike</Text>
                <Text style={detailValue}>{bike}</Text>
              </Row>
            </Section>
            <Section style={ctaSection}>
              <Button href={interestUrl} style={ctaButton}>I'm Available</Button>
            </Section>
            <Hr style={hr} />
            <Text style={smallText}>This link expires in 7 days. The owner will confirm your assignment — responding here does not guarantee the shift.</Text>
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
const header = { backgroundColor: "#E8722A", padding: "32px 40px" };
const headerTitle = { color: "#ffffff", fontSize: "24px", fontWeight: "700", margin: "0" };
const headerTagline = { color: "#fde68a", fontSize: "14px", margin: "4px 0 0" };
const content = { padding: "32px 40px" };
const h2 = { fontSize: "22px", color: "#111827", fontWeight: "700", margin: "0 0 12px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 16px" };
const smallText = { fontSize: "12px", color: "#9ca3af", margin: "0" };
const detailsBox = { backgroundColor: "#f9fafb", borderRadius: "8px", padding: "20px 24px", marginBottom: "24px" };
const detailLabel = { fontSize: "12px", color: "#6b7280", margin: "4px 0 0", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const detailValue = { fontSize: "15px", color: "#111827", margin: "0 0 12px", fontWeight: "500" };
const ctaSection = { margin: "24px 0" };
const ctaButton = { backgroundColor: "#E8722A", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
