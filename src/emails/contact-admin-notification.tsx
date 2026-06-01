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
import type { ContactInput } from "@/lib/validations/contact";

type ContactAdminNotificationEmailProps = ContactInput & {
  id: string;
};

export function ContactAdminNotificationEmail({
  id,
  name,
  email,
  phone,
  company,
  subject,
  companySize,
  message,
}: ContactAdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact inquiry from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New contact inquiry</Heading>
          <Text style={paragraph}>
            <strong>ID:</strong> {id}
          </Text>
          <Text style={paragraph}>
            <strong>Name:</strong> {name}
          </Text>
          <Text style={paragraph}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={paragraph}>
            <strong>Phone:</strong> {phone}
          </Text>
          <Text style={paragraph}>
            <strong>Company:</strong> {company}
          </Text>
          <Text style={paragraph}>
            <strong>Subject:</strong> {subject}
          </Text>
          <Text style={paragraph}>
            <strong>Company size:</strong> {companySize}
          </Text>
          <Text style={paragraph}>
            <strong>Message:</strong>
          </Text>
          <Text style={messageBox}>{message}</Text>
          <Hr style={hr} />
          <Text style={footer}>QTO ERP — admin notification</Text>
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
  margin: "0 0 8px",
};

const messageBox = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#374151",
  backgroundColor: "#f3f4f6",
  padding: "12px",
  borderRadius: "6px",
  whiteSpace: "pre-wrap" as const,
  margin: "0 0 16px",
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
