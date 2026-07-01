import { defineEventHandler } from 'h3';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({
    headers: event.headers,
  });

  const currentUserId = session?.user?.id;

  const articles = await prisma.article.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          subscription: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Filter: publicly visible if author has subscription, 
  // OR if the current user is the author.
  const visibleArticles = articles.filter((article: any) => {
    const isAuthorSubscribed = !!article.user.subscription;
    const isCurrentUserAuthor = currentUserId === article.user.id;
    return isAuthorSubscribed || isCurrentUserAuthor;
  });

  return {
    articles: visibleArticles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      body: article.body.substring(0, 200) + (article.body.length > 200 ? '...' : ''),
      author: {
        id: article.user.id,
        name: article.user.name,
        email: article.user.email
      },
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    }))
  };
});
