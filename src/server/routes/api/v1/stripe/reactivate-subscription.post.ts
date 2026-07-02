import { defineEventHandler, createError } from 'h3';
import { requireAuth } from '../../../../utils/require-auth';
import { prisma } from '../../../../../lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-01-27.acacia',
});

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const user = session.user;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No subscription found to reactivate',
    });
  }

  // Reactivate in Stripe (remove cancel_at_period_end)
  const reactivatedSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { cancel_at_period_end: false }
  );

  // Update DB status
  await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      status: reactivatedSubscription.status,
      cancelAtPeriodEnd: reactivatedSubscription.cancel_at_period_end,
      currentPeriodEnd: new Date(reactivatedSubscription.current_period_end * 1000),
    },
  });

  return {
    success: true,
    status: reactivatedSubscription.status,
    cancelAtPeriodEnd: reactivatedSubscription.cancel_at_period_end,
  };
});
