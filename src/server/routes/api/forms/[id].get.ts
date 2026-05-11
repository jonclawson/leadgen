import { defineEventHandler, getRouterParam, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { prisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Form ID is required'
    });
  }

  const form = await prisma.dynamicForm.findUnique({
    where: { id },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!form) {
    throw createError({
      statusCode: 404,
      message: 'Form not found'
    });
  }

  if (form.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to access this form'
    });
  }

  return { form };
});
