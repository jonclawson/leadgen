import { promises as fs } from 'fs';
import { createHash, randomBytes } from 'crypto';
import { resolve, extname } from 'path';

export interface FileValidationOptions {
  maxSize?: number; // in bytes, default 5MB
  mimeTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB

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

export async function saveFile(file: { data: Buffer; name: string }): Promise<string> {
  try {
    const filename = generateUniqueFilename(file.name);
    const filesDir = getPublicFilesDir();
    
    // Ensure the files directory exists
    await fs.mkdir(filesDir, { recursive: true });
    
    const filepath = resolve(filesDir, filename);
    await fs.writeFile(filepath, file.data);
    
    return `/files/${filename}`;
  } catch (error) {
    throw new Error(`Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFile(fileUrl: string | null): Promise<void> {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return;
  }

  try {
    // Only delete files from our /files/ directory
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
  } catch (error) {
    // Silently ignore if file doesn't exist or can't be deleted
    console.warn(`Could not delete file ${fileUrl}:`, error instanceof Error ? error.message : 'Unknown error');
  }
}
