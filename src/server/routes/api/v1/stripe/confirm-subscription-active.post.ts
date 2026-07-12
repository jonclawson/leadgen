import { defineEventHandler, createError } from 'h3';
import { requireAuth } from '../../../../utils/require-auth';
import { getPrisma } from '../../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const session = await requireAuth(event);
  const user = session.user;

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No subscription found to confirm',
    });
  }

  // Update subscription status to active
  const updatedSubscription = await prisma.subscription.update({
    where: { userId: user.id },
    data: {
      status: 'active',
    },
  });

  return {
    success: true,
    subscription: updatedSubscription,
  };
});
