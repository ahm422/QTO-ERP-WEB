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

type SubscriptionAdminNotificationEmailProps = {
  planSlug: string;
  billingInterval: string;
  customerEmail: string;
  stripeCheckoutSessionId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
};

export function SubscriptionAdminNotificationEmail({
  planSlug,
  billingInterval,
  customerEmail,
  stripeCheckoutSessionId,
  stripeCustomerId,
  stripeSubscriptionId,
}: SubscriptionAdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New subscription: {planSlug}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New subscription checkout</Heading>
          <Text style={paragraph}>
            <strong>Plan:</strong> {planSlug}
          </Text>
          <Text style={paragraph}>
            <strong>Billing:</strong> {billingInterval}
          </Text>
          <Text style={paragraph}>
            <strong>Customer email:</strong> {customerEmail}
          </Text>
          <Text style={paragraph}>
            <strong>Checkout session:</strong> {stripeCheckoutSessionId}
          </Text>
          <Text style={paragraph}>
            <strong>Stripe customer:</strong> {stripeCustomerId}
          </Text>
          <Text style={paragraph}>
            <strong>Stripe subscription:</strong>{" "}
            {stripeSubscriptionId ?? "—"}
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
