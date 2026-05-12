import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { prisma } from '../../../../lib/prisma';

interface UpdateArticleRequest {
  title: string;
  slug: string;
  body: string;
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<UpdateArticleRequest>(event);

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
      message: 'You do not have permission to update this article'
    });
  }

  if (!body.title || body.title.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Article title is required'
    });
  }

  if (!body.slug || body.slug.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Article slug is required'
    });
  }

  if (!body.body || body.body.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Article body is required'
    });
  }

  // Check if slug is being changed and if it conflicts with another article
  if (body.slug !== existingArticle.slug) {
    const conflictingArticle = await prisma.article.findUnique({
      where: { slug: body.slug }
    });

    if (conflictingArticle) {
      throw createError({
        statusCode: 400,
        message: 'An article with this slug already exists. Please choose a different slug.'
      });
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: body.title,
      slug: body.slug,
      body: body.body
    },
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

  return { article };
});
