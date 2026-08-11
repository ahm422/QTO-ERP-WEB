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

type UserInviteEmailProps = {
  name?: string | null;
  email: string;
  setPasswordUrl: string;
  invitedBy?: string | null;
};

export function UserInviteEmail({
  name,
  email,
  setPasswordUrl,
  invitedBy,
}: UserInviteEmailProps) {
  const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi,";

  return (
    <Html>
      <Head />
      <Preview>You&apos;re invited to QTO Admin</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>You&apos;re invited to QTO Admin</Heading>
          <Text style={paragraph}>{greeting}</Text>
          <Text style={paragraph}>
            {invitedBy
              ? `${invitedBy} invited you to the QTO ERP admin panel as ${email}.`
              : `You have been invited to the QTO ERP admin panel as ${email}.`}
          </Text>
          <Text style={paragraph}>
            Set your password using the link below. This link expires in 1 hour.
          </Text>
          <Text style={paragraph}>
            <a href={setPasswordUrl} style={link}>
              Set your password
            </a>
          </Text>
          <Text style={muted}>
            Or copy and paste this URL into your browser:
            <br />
            {setPasswordUrl}
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
