import { defineEventHandler, getRouterParam, createError } from 'h3';
import { getPrisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
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

  return { form };
});
