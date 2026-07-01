import { defineEventHandler, readBody, createError } from 'h3';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const body = await readBody(event);
  const { subscribe } = body;

  const userId = session.user.id;

  if (subscribe) {
    // Create subscription if it doesn't exist
    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {},
      create: { 
        userId,
        plan: 'premium' // Default plan for now
      }
    });
    return { subscribed: true, subscription };
  } else {
    // Remove subscription
    await prisma.subscription.deleteMany({
      where: { userId }
    });
    return { subscribed: false };
  }
});
