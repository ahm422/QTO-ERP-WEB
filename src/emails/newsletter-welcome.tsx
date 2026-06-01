import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export function NewsletterWelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Welcome to QTO ERP updates</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re subscribed</Heading>
          <Text style={paragraph}>
            Thanks for subscribing to QTO ERP updates. You&apos;ll receive the
            latest news, product updates, and insights in your inbox.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>QTO ERP</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#111827",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 12px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0",
};
