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

type DemoReplyEmailProps = {
  name: string;
  body: string;
};

export function DemoReplyEmail({ name, body }: DemoReplyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reply from QTO ERP</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Message from QTO ERP</Heading>
          <Text style={paragraph}>Hi {name},</Text>
          <Text style={paragraph}>{body}</Text>
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
  whiteSpace: "pre-wrap" as const,
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
