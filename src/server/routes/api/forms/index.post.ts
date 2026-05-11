import { defineEventHandler, readBody, createError } from 'h3';
import { requireAuth } from '../../../utils/require-auth';
import { prisma } from '../../../../lib/prisma';

interface CreateFormRequest {
  name: string;
  description?: string;
  fields: Array<{
    type: string;
    key: string;
    label?: string;
    icon?: string;
    placeholder?: string;
    validators?: string;
    buttonLabel?: string;
    buttonColor?: string;
    order: number;
  }>;
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event);
  const body = await readBody<CreateFormRequest>(event);

  if (!body.name || body.name.trim() === '') {
    throw createError({
      statusCode: 400,
      message: 'Form name is required'
    });
  }

  if (!body.fields || body.fields.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'At least one field is required'
    });
  }

  const form = await prisma.dynamicForm.create({
    data: {
      name: body.name,
      description: body.description,
      userId: session.user.id,
      fields: {
        create: body.fields.map(field => ({
          type: field.type,
          key: field.key,
          label: field.label,
          icon: field.icon,
          placeholder: field.placeholder,
          validators: field.validators,
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
