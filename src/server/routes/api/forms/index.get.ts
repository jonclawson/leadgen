import { defineEventHandler } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { getPrisma } from '../../../../lib/prisma';

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const session = await requireAuth(event);

  const forms = await prisma.dynamicForm.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { fields: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return {
    forms: forms.map((form: any) => ({
      id: form.id,
      name: form.name,
      description: form.description,
      fieldCount: form._count.fields,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt
    }))
  };
});
