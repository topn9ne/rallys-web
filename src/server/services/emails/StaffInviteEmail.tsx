import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface StaffInviteEmailProps {
  name: string;
  inviteUrl: string;
  role: string;
}

export function StaffInviteEmail({ name, inviteUrl, role }: StaffInviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join the Railside Rides team — set up your account now.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Railside Rides</Heading>
            <Text style={headerTagline}>Team Invite</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>Welcome to the team, {name}!</Heading>
            <Text style={text}>
              You've been added to the Railside Rides staff as a <strong>{role}</strong>. Click the button below to set your password and activate your account.
            </Text>
            <Section style={ctaSection}>
              <Button href={inviteUrl} style={ctaButton}>Set My Password</Button>
            </Section>
            <Text style={smallText}>This link expires in 48 hours. If you weren't expecting this, you can safely ignore it.</Text>
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
const header = { backgroundColor: "#2B5CE6", padding: "32px 40px" };
const headerTitle = { color: "#ffffff", fontSize: "24px", fontWeight: "700", margin: "0" };
const headerTagline = { color: "#93c5fd", fontSize: "14px", margin: "4px 0 0" };
const content = { padding: "32px 40px" };
const h2 = { fontSize: "22px", color: "#111827", fontWeight: "700", margin: "0 0 12px" };
const text = { fontSize: "15px", color: "#374151", lineHeight: "1.6", margin: "0 0 16px" };
const smallText = { fontSize: "12px", color: "#9ca3af", margin: "16px 0 0" };
const ctaSection = { margin: "24px 0" };
const ctaButton = { backgroundColor: "#2B5CE6", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", textDecoration: "none", display: "inline-block" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
