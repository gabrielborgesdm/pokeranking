"use server";

import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";

export async function fetchClientSecret(): Promise<string> {
  const origin = (await headers()).get("origin");
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

  if (!priceId) {
    throw new Error("Stripe price ID not configured");
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${origin}/contribute/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  if (!session.client_secret) {
    throw new Error("Failed to create checkout session");
  }

  return session.client_secret;
}
