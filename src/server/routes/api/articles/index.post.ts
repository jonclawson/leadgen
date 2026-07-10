import { defineEventHandler, readBody, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { prisma } from '../../../../lib/prisma';

interface CreateArticleRequest {
  title: string;
  slug: string;
  body: string;
  image_url?: string | null;
  formId?: string | null;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const body = await readBody<CreateArticleRequest>(event);

  if (!body.title || body.title.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Article title is required'
    });
  }

  if (!body.body || body.body.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Article body is required'
    });
  }

  // Generate slug if not provided
  let slug = body.slug && body.slug.trim() !== '' ? body.slug.trim() : generateSlug(body.title);

  // Check if slug already exists
  const existingArticle = await prisma.article.findUnique({
    where: { slug }
  });

  if (existingArticle) {
    throw createError({
      statusCode: 400,
      message: 'An article with this slug already exists. Please choose a different slug.'
    });
  }

  // Validate formId if provided
  if (body.formId) {
    const form = await prisma.dynamicForm.findUnique({
      where: { id: body.formId }
    });

    if (!form) {
      throw createError({
        statusCode: 400,
        message: 'The selected form does not exist'
      });
    }
  }

  const article = await prisma.article.create({
    data: {
      title: body.title,
      slug: slug,
      body: body.body,
      image_url: body.image_url || null,
      userId: session.user.id,
      formId: body.formId || null
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
