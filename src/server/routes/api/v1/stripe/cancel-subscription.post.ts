import { defineEventHandler, createError } from 'h3';
import { requireAuth } from '../../../../utils/require-auth';
import { getPrisma } from '../../../../../lib/prisma';
import Stripe from 'stripe';

const env = process.env || (globalThis as any)?.__env__;
const stripe = new Stripe(env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-01-27.acacia',
});

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const session = await requireAuth(event);
  const user = session.user;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No active subscription found to cancel',
    });
  }

  // Cancel in Stripe (at end of period)
  const canceledSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { cancel_at_period_end: true }
  );

  // Update DB status
  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      status: canceledSubscription.status,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000),
    },
  });

  return {
    success: true,
    status: canceledSubscription.status,
  };
});
