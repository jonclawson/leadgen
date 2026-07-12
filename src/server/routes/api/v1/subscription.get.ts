import { defineEventHandler } from 'h3';
import { getPrisma } from '../../../../lib/prisma';
import { getAuth } from '../../../utils/auth';
import { isSubscriptionActive } from '../../../utils/subscription';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    return { subscribed: false, isActive: false };
  }

  let subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id }
  });

  // Passive Update: If subscription is past its period end and scheduled for cancellation, 
  // update the status to 'canceled' in the database.
  if (
    subscription && 
    subscription.status === 'active' && 
    subscription.cancelAtPeriodEnd && 
    subscription.currentPeriodEnd && 
    new Date(subscription.currentPeriodEnd) < new Date()
  ) {
    subscription = await prisma.subscription.update({
      where: { id: subscription.id, userId: session.user.id },
      data: { status: 'canceled' }
    });
  }

  return { 
    subscribed: !!subscription,
    isActive: isSubscriptionActive(subscription),
    subscription: subscription || null 
  };
});
