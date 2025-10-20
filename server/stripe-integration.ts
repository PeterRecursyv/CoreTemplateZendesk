import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-09-30.clover',
    });
  }
  
  return stripeInstance;
}

export interface CreateCheckoutSessionParams {
  purchaseId: string;
  customerEmail: string;
  customerName: string;
  pricingTierName: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeInstance();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: `${params.pricingTierName} Integration Plan`,
            description: 'Monthly subscription for integration service',
          },
          unit_amount: params.amount * 100, // Convert to cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    customer_email: params.customerEmail,
    client_reference_id: params.purchaseId,
    metadata: {
      purchaseId: params.purchaseId,
      customerName: params.customerName,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
  
  return session;
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeInstance();
  return await stripe.checkout.sessions.retrieve(sessionId);
}

export async function handleWebhook(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
  const stripe = getStripeInstance();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }
  
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

