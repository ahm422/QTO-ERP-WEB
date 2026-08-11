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

type PasswordResetEmailProps = {
  name?: string | null;
  resetUrl: string;
  expiresInMinutes: number;
};

export function PasswordResetEmail({
  name,
  resetUrl,
  expiresInMinutes,
}: PasswordResetEmailProps) {
  const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi,";

  return (
    <Html>
      <Head />
      <Preview>Reset your QTO Admin password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset your password</Heading>
          <Text style={paragraph}>{greeting}</Text>
          <Text style={paragraph}>
            We received a request to reset your QTO ERP admin password. Use the
            link below to choose a new password. This link expires in{" "}
            {expiresInMinutes} minutes.
          </Text>
          <Text style={paragraph}>
            <a href={resetUrl} style={link}>
              Reset your password
            </a>
          </Text>
          <Text style={muted}>
            Or copy and paste this URL into your browser:
            <br />
            {resetUrl}
          </Text>
          <Text style={paragraph}>
            If you did not request this, you can ignore this email.
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

const muted = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "0 0 12px",
  wordBreak: "break-all" as const,
};

const link = {
  color: "#ea580c",
  textDecoration: "underline",
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
