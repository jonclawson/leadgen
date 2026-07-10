import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import { requireAuth } from '../../utils/require-auth';
import { validateFile, saveFile } from '../../utils/file-upload';

export default defineEventHandler(async (event) => {
  await requireAuth(event);

  try {
    const formData = await readMultipartFormData(event);
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file provided'
      });
    }

    // Find the file field
    const fileField = formData.find(field => field.filename);
    if (!fileField || !fileField.data) {
      throw createError({
        statusCode: 400,
        message: 'No file data found'
      });
    }

    // Validate file
    const validation = validateFile(
      {
        size: fileField.data.length,
        type: fileField.type || 'application/octet-stream',
        name: fileField.filename || 'file'
      },
      {
        maxSize: 5 * 1024 * 1024, // 5MB
        mimeTypes: ['image/*', 'application/pdf', 'application/msword']
      }
    );

    if (!validation.valid) {
      throw createError({
        statusCode: 400,
        message: validation.error || 'File validation failed'
      });
    }

    // Save file
    const fileUrl = await saveFile({
      data: fileField.data,
      name: fileField.filename || 'file'
    });

    return { fileUrl };
  } catch (error) {
    if (error instanceof Error && error.message.includes('statusCode')) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});
