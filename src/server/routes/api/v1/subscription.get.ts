import { defineEventHandler } from 'h3';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    return { subscribed: false };
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id }
  });

  return { 
    subscribed: !!subscription,
    subscription: subscription || null 
  };
});
