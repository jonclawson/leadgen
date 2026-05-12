import { defineEventHandler } from 'h3';
import { prisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const articles = await prisma.article.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    articles: articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      body: article.body.substring(0, 200) + (article.body.length > 200 ? '...' : ''),
      author: article.user,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt
    }))
  };
});
