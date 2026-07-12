import { defineEventHandler, getRouterParam, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { getPrisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Article ID is required'
    });
  }

  const existingArticle = await prisma.article.findUnique({
    where: { id }
  });

  if (!existingArticle) {
    throw createError({
      statusCode: 404,
      message: 'Article not found'
    });
  }

  if (existingArticle.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to delete this article'
    });
  }

  await prisma.article.delete({
    where: { id }
  });

  return { success: true, message: 'Article deleted successfully' };
});
