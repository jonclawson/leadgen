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

  const existingForm = await prisma.dynamicForm.findUnique({
    where: { id }
  });

  if (!existingForm) {
    throw createError({
      statusCode: 404,
      message: 'Form not found'
    });
  }

  if (existingForm.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to delete this form'
    });
  }

  await prisma.dynamicForm.delete({
    where: { id }
  });

  return { success: true, message: 'Form deleted successfully' };
});
