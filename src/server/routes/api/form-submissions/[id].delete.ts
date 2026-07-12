import { defineEventHandler, createError, getRouterParam } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { getPrisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Submission ID is required'
    });
  }

  // Find the submission
  const submission = await prisma.formSubmission.findUnique({
    where: { id }
  });

  if (!submission) {
    throw createError({
      statusCode: 404,
      message: 'Submission not found'
    });
  }

  // Verify the authenticated user is the form creator (owns this form)
  if (submission.userId !== session.user.id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to delete this submission'
    });
  }

  // Delete the submission
  await prisma.formSubmission.delete({
    where: { id }
  });

  return { success: true };
});
