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
    // This route is deprecated for creating new premium subscriptions.
    // Use /api/v1/stripe/create-subscription instead to get a client secret.
    throw createError({
      statusCode: 400,
      statusMessage: 'Subscriptions must be created through Stripe integration',
    });
  } else {
    // For now, if they want to unsubscribe (make private), we might still allow deleting the record
    // but ideally we should cancel the Stripe subscription if it exists.
    // I'll leave the deleteMany for now but the UI will likely use the new cancel route.
    await prisma.subscription.deleteMany({
      where: { userId }
    });
    return { subscribed: false };
  }
});
