import { promises as fs } from 'fs';
import { createHash, randomBytes } from 'crypto';
import { resolve, extname } from 'path';

export interface FileValidationOptions {
  maxSize?: number; // in bytes, default 5MB
  mimeTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

async function isCloudflareWorkers(): Promise<boolean> {
  try {
    await import('cloudflare:workers');
    return true;
  } catch (e) {
    return false;
  }
}

export function getPublicFilesDir(): string {
  return resolve(process.cwd(), 'public', 'files');
}

export function generateUniqueFilename(originalName: string): string {
  const ext = extname(originalName);
  const hash = randomBytes(8).toString('hex');
  const nameWithoutExt = originalName.slice(0, originalName.lastIndexOf(ext) || originalName.length);
  return `${hash}-${nameWithoutExt}${ext}`;
}

export function validateFile(
  file: { size: number; type: string; name: string },
  options?: FileValidationOptions
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || DEFAULT_MAX_SIZE;
  const mimeTypes = options?.mimeTypes;

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  if (mimeTypes && !mimeTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  })) {
    return {
      valid: false,
      error: `File type not allowed. Accepted types: ${mimeTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Save file to local filesystem (Node/Docker) or R2 (Cloudflare)
 * Returns the public URL to access the file
 */
export async function saveFile(file: { data: Buffer; name: string }): Promise<string> {
  try {
    const filename = generateUniqueFilename(file.name);
    
    // Check if running in Cloudflare Workers
    const isWorkers = await isCloudflareWorkers();
    
    if (isWorkers) {
      // Use R2 for Cloudflare
      const { env } = await import('cloudflare:workers');
      const r2Bucket = (env as any).R2;
      
      if (!r2Bucket) {
        throw new Error('R2 bucket not configured in Cloudflare environment');
      }
      
      // Upload to R2
      await r2Bucket.put(filename, file.data, {
        httpMetadata: {
          contentType: file.name.endsWith('.svg') ? 'image/svg+xml' : 'application/octet-stream',
        },
      });
      
      // Return the R2 public URL (adjust based on your R2 public URL configuration)
      // For now, return a relative path that can be resolved to your R2 domain
      return `/r2/${filename}`;
    } else {
      // Use local filesystem for Node/Docker
      const filesDir = getPublicFilesDir();
      
      // Ensure the files directory exists
      await fs.mkdir(filesDir, { recursive: true });
      
      const filepath = resolve(filesDir, filename);
      await fs.writeFile(filepath, file.data);
      
      return `/files/${filename}`;
    }
  } catch (error) {
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete file from local filesystem (Node/Docker) or R2 (Cloudflare)
 */
export async function deleteFile(fileUrl: string | null): Promise<void> {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return;
  }

  try {
    const isWorkers = await isCloudflareWorkers();
    
    if (isWorkers) {
      // Delete from R2
      if (!fileUrl.startsWith('/r2/')) {
        return; // Only delete files from R2
      }
      
      const { env } = await import('cloudflare:workers');
      const r2Bucket = (env as any).R2;
      
      if (!r2Bucket) {
        console.warn('R2 bucket not configured, cannot delete file');
        return;
      }
      
      const filename = fileUrl.replace('/r2/', '');
      await r2Bucket.delete(filename);
    } else {
      // Delete from local filesystem
      if (!fileUrl.startsWith('/files/')) {
        return;
      }

      const filename = fileUrl.replace('/files/', '');
      const filepath = resolve(getPublicFilesDir(), filename);
      
      // Ensure the file is within the files directory (security check)
      const filesDir = getPublicFilesDir();
      if (!filepath.startsWith(filesDir)) {
        throw new Error('Invalid file path');
      }

      await fs.unlink(filepath);
    }
  } catch (error) {
    // Silently ignore if file doesn't exist or can't be deleted
    console.warn(`Could not delete file ${fileUrl}:`, error instanceof Error ? error.message : 'Unknown error');
  }
}
