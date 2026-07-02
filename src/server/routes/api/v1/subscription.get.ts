import { defineEventHandler } from 'h3';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../utils/auth';
import { isSubscriptionActive } from '../../../utils/subscription';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    return { subscribed: false, isActive: false };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id }
  });

  return { 
    subscribed: !!subscription,
    isActive: isSubscriptionActive(subscription),
    subscription: subscription || null 
  };
});
