import { defineEventHandler, getRouterParam, createError } from 'h3';
import { prisma } from '../../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

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
          email: true
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

  return { article };
});
