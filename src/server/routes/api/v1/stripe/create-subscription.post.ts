import { defineEventHandler, readBody, createError } from 'h3';
import { requireAuth } from '../../../../utils/require-auth';
import { prisma } from '../../../../../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-01-27.acacia', // Best practice: use a specific API version
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const user = session.user;
  const priceId = process.env['STRIPE_PRICE_ID'];

  if (!priceId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe Price ID not configured',
    });
  }

  // Find or create customer
  let subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  let customerId = subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });
    customerId = customer.id;
  }

  // Create the subscription
  const stripeSubscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: {
      userId: user.id,
    },
  });

  // Update DB
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      status: 'active', // stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      plan: 'premium',
    },
    update: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      status: stripeSubscription.status,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      plan: 'premium',
    },
  });

  const invoice = stripeSubscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  return {
    subscriptionId: stripeSubscription.id,
    clientSecret: paymentIntent.client_secret,
  };
});
