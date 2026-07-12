import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { getPrisma } from '../../../../lib/prisma';

interface UpdateFormRequest {
  name: string;
  description?: string;
  fields: Array<{
    id?: string;
    type: string;
    key: string;
    label?: string;
    icon?: string;
    placeholder?: string;
    validators?: string;
    options?: string;
    buttonLabel?: string;
    buttonColor?: string;
    order: number;
  }>;
}

export default defineEventHandler(async (event) => {
  const prisma = await getPrisma();
  const session = await requireAuth(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<UpdateFormRequest>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Form ID is required'
    });
  }

  const existingForm = await prisma.dynamicForm.findUnique({
    where: { id },
    include: { fields: true }
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
      message: 'You do not have permission to update this form'
    });
  }

  // Delete all existing fields and recreate
  await prisma.formFieldDefinition.deleteMany({
    where: { dynamicFormId: id }
  });

  const form = await prisma.dynamicForm.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      fields: {
        create: body.fields.map(field => ({
          type: field.type,
          key: field.key,
          label: field.label,
          icon: field.icon,
          placeholder: field.placeholder,
          validators: field.validators,
          options: field.options,
          buttonLabel: field.buttonLabel,
          buttonColor: field.buttonColor,
          order: field.order
        }))
      }
    },
    include: {
      fields: {
        orderBy: { order: 'asc' }
      }
    }
  });

  return { form };
});
