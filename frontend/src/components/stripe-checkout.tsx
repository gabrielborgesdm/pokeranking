"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import { fetchClientSecret } from "@/app/actions/stripe";
import { getClientConfig } from "@/lib/config";

const config = getClientConfig();
const stripePromise = config.stripePublishableKey
  ? loadStripe(config.stripePublishableKey)
  : null;

export function StripeCheckout() {
  if (!stripePromise) {
    return null;
  }

  return (
    <div id="checkout" className="stripe-checkout-container">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
