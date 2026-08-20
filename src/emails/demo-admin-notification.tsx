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
import type { DemoInput } from "@/lib/validations/demo";

type DemoAdminNotificationEmailProps = DemoInput & {
  id: string;
};

export function DemoAdminNotificationEmail({
  id,
  name,
  email,
  phone,
  companyPhone,
  country,
  company,
  businessType,
}: DemoAdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New demo request from {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New demo request</Heading>
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
            <strong>Company phone:</strong> {companyPhone}
          </Text>
          <Text style={paragraph}>
            <strong>Country:</strong> {country}
          </Text>
          <Text style={paragraph}>
            <strong>Company:</strong> {company}
          </Text>
          <Text style={paragraph}>
            <strong>Business type:</strong> {businessType}
          </Text>
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

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#6b7280",
  margin: "0",
};
