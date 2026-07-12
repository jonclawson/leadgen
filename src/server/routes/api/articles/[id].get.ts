import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getPrisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
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

  return { article };
});
