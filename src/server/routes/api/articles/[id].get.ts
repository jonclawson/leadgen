import { defineEventHandler, getRouterParam, createError } from 'h3';
import { prisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Article ID is required'
    });
  }

  const article = await prisma.article.findUnique({
    where: { id },
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
