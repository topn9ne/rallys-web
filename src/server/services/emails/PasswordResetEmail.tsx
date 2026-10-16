import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail({ name, resetUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your Rally&apos;s Indoor Training password — link expires in 1 hour.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Rally&apos;s Indoor Training</Heading>
            <Text style={headerTagline}>Password Reset</Text>
          </Section>
          <Section style={content}>
            <Heading as="h2" style={h2}>Reset your password, {name}</Heading>
            <Text style={text}>
              We received a request to reset your password. Click the button below to choose a new one.
            </Text>
            <Section style={ctaSection}>
              <Button href={resetUrl} style={ctaButton}>Reset Password</Button>
            </Section>
            <Hr style={hr} />
            <Text style={smallText}>This link expires in <strong>1 hour</strong>. If you didn&apos;t request a password reset, you can safely ignore this email.</Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>Rally&apos;s Indoor Training &middot; Hastings, NE</Text>
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
const smallText = { fontSize: "12px", color: "#9ca3af", margin: "0" };
const ctaSection = { margin: "24px 0" };
const ctaButton = { backgroundColor: "#2B5CE6", borderRadius: "8px", color: "#ffffff", fontSize: "15px", fontWeight: "600", padding: "12px 28px", textDecoration: "none", display: "inline-block" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const footer = { backgroundColor: "#f9fafb", padding: "20px 40px", borderTop: "1px solid #e5e7eb" };
const footerText = { fontSize: "12px", color: "#9ca3af", margin: "2px 0" };
