import { defineEventHandler, readRawBody, createError } from 'h3';
import { prisma } from '../../../../../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-01-27.acacia',
});

const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

export default defineEventHandler(async (event) => {
  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook secret not configured',
    });
  }

  const signature = event.headers.get('stripe-signature');
  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header',
    });
  }

  const rawBody = await readRawBody(event);
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empty body',
    });
  }

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook Error: ${err.message}`,
    });
  }

  console.log(`Handling webhook event: ${stripeEvent.type}`);

  switch (stripeEvent.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      const userId = subscription.metadata['userId'];

      if (userId) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            stripePriceId: subscription.items.data[0]?.price.id,
          },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = stripeEvent.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const stripeSubId = invoice.subscription as string;
        const fullSubscription = await stripe.subscriptions.retrieve(stripeSubId);
        const userId = fullSubscription.metadata['userId'];

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: fullSubscription.status,
              currentPeriodEnd: new Date(fullSubscription.current_period_end * 1000),
            },
          });
        }
      }
      break;
    }
  }

  return { received: true };
});
