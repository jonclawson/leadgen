import { defineEventHandler, getRouterParam, createError } from 'h3';
import { prisma } from '../../../../../lib/prisma';
import { auth } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  const currentUserId = session?.user?.id;

  console.log('Fetching article with slug:', slug);

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Article slug is required'
    });
  }

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          subscription: true
        }
      },
      form: {
        select: {
          id: true,
          name: true,
          fields: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  if (!article) {
    throw createError({
      statusCode: 404,
      message: 'Article not found'
    });
  }

  // Visibility check:
  // If author is not subscribed, only the author can see it.
  const isAuthorSubscribed = !!article.user.subscription;
  const isCurrentUserAuthor = currentUserId === article.user.id;

  if (!isAuthorSubscribed && !isCurrentUserAuthor) {
    throw createError({
      statusCode: 404, // Use 404 to hide existence
      message: 'Article not found'
    });
  }

  // Clean up the user object before returning to exclude subscription data
  const { subscription, ...userData } = article.user;

  return { 
    article: {
      ...article,
      user: userData
    } 
  };
});
