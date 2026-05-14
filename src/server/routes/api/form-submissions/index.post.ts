import { defineEventHandler, readBody, createError } from 'h3';
import { prisma } from '../../../../lib/prisma';

interface SubmitFormRequest {
  formId: string;
  articleId: string;
  data: Record<string, unknown>;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SubmitFormRequest>(event);

  if (!body.formId || !body.formId.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Form ID is required'
    });
  }

  if (!body.articleId || !body.articleId.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Article ID is required'
    });
  }

  if (!body.data || typeof body.data !== 'object') {
    throw createError({
      statusCode: 400,
      message: 'Form data is required'
    });
  }

  // Verify form exists and get the form creator's userId
  const form = await prisma.dynamicForm.findUnique({
    where: { id: body.formId }
  });

  if (!form) {
    throw createError({
      statusCode: 404,
      message: 'Form not found'
    });
  }

  // Verify article exists
  const article = await prisma.article.findUnique({
    where: { id: body.articleId }
  });

  if (!article) {
    throw createError({
      statusCode: 404,
      message: 'Article not found'
    });
  }

  // Create submission with form creator's userId
  const submission = await prisma.formSubmission.create({
    data: {
      formId: body.formId,
      articleId: body.articleId,
      userId: form.userId, // Store form creator's userId, not submitter
      data: JSON.stringify(body.data)
    },
    include: {
      form: {
        select: {
          id: true,
          name: true
        }
      },
      article: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  return { submission };
});
