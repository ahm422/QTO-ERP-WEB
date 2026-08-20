import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { createSubscriptionCheckoutSession } from "@/lib/stripe-checkout";
import { pricingCheckoutSchema } from "@/lib/validations/pricing-checkout";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = pricingCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const result = await createSubscriptionCheckoutSession({
    ...parsed.data,
    trial: true,
    logLabel: "api/pricing/trial",
  });

  if (!result.ok) {
    return jsonError(result.error, result.status);
  }

  return NextResponse.json({ url: result.url });
}
