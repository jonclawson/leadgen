import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3';
import { promises as fs } from 'fs';
import { resolve, extname } from 'path';
import { getPublicFilesDir } from '../../utils/file-upload';

/**
 * Get MIME type from file extension
 */
function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Validate filename to prevent directory traversal
 */
function validateFilename(filename: string): boolean {
  // Check for path separators and null bytes
  if (filename.includes('/') || filename.includes('\\') || filename.includes('\0')) {
    return false;
  }
  // Check for parent directory references
  if (filename.includes('..')) {
    return false;
  }
  return true;
}

async function isCloudflareWorkers(): Promise<boolean> {
  try {
    await import('cloudflare:workers');
    return true;
  } catch (e) {
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename');

  // Validate filename parameter
  if (!filename || typeof filename !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Filename is required'
    });
  }

  // Security: prevent directory traversal
  if (!validateFilename(filename)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid filename'
    });
  }

  try {
    const isWorkers = await isCloudflareWorkers();

    if (isWorkers) {
      // Cloudflare Workers: retrieve from R2
      const { env } = await import('cloudflare:workers');
      const r2Bucket = (env as any).R2;

      if (!r2Bucket) {
        throw createError({
          statusCode: 500,
          message: 'R2 bucket not configured'
        });
      }

      const object = await r2Bucket.get(filename);

      if (!object) {
        throw createError({
          statusCode: 404,
          message: 'File not found'
        });
      }

      const mimeType = getMimeType(filename);
      setResponseHeader(event, 'Content-Type', mimeType);
      setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

      return object.stream();
    } else {
      // Node.js/Docker: retrieve from local filesystem
      const filesDir = getPublicFilesDir();
      const filepath = resolve(filesDir, filename);

      // Security: ensure file is within the files directory
      if (!filepath.startsWith(filesDir)) {
        throw createError({
          statusCode: 400,
          message: 'Invalid filename'
        });
      }

      try {
        const data = await fs.readFile(filepath);
        const mimeType = getMimeType(filename);
        setResponseHeader(event, 'Content-Type', mimeType);
        setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

        return data;
      } catch (error) {
        if ((error as any).code === 'ENOENT') {
          throw createError({
            statusCode: 404,
            message: 'File not found'
          });
        }
        throw error;
      }
    }
  } catch (error) {
    if (error instanceof Error && (error as any).statusCode) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      message: `Failed to retrieve file: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});
