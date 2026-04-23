import { BadRequestException } from '@nestjs/common';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import type { Request } from 'express';

/**
 * Hard cap on request body size for file uploads. Protects memory of the
 * container against adversarial uploads. Multer buffers in memory by default,
 * so keep this conservative.
 */
export const MAX_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

/**
 * Allowlist of MIME types accepted for business document uploads (operations
 * and document management). Anything outside this set is rejected.
 */
export const DOCUMENT_UPLOAD_MIME_TYPES = new Set<string>([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/heic',
  'image/heif',
  'image/bmp',
  'image/svg+xml',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/rtf',
  'text/plain',
  'text/csv',
  'text/tab-separated-values',
  'application/xml',
  'text/xml',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/octet-stream',
]);

/**
 * Narrow allowlist for CSV-only endpoints (bulk import jobs).
 * Los navegadores envían tipos MIME inconsistentes para CSV dependiendo del
 * sistema operativo (Excel en Windows reporta `application/vnd.ms-excel`,
 * macOS a veces envía `application/octet-stream`, etc.). Aceptamos el
 * superconjunto razonable y validamos la extensión vía fileFilter abajo.
 */
export const CSV_UPLOAD_MIME_TYPES = new Set<string>([
  'text/csv',
  'application/vnd.ms-excel',
  'application/csv',
  'application/x-csv',
  'text/x-csv',
  'text/comma-separated-values',
  'text/plain',
  'application/octet-stream',
]);

type MulterFile = Parameters<NonNullable<MulterOptions['fileFilter']>>[1];
type MulterCallback = Parameters<NonNullable<MulterOptions['fileFilter']>>[2];

function makeFileFilter(
  allowedMimeTypes: Set<string>,
): NonNullable<MulterOptions['fileFilter']> {
  return (_req: Request, file: MulterFile, callback: MulterCallback): void => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new BadRequestException(
          `File type "${file.mimetype}" is not allowed. Allowed types: ${[...allowedMimeTypes].join(', ')}`,
        ),
        false,
      );
      return;
    }
    callback(null, true);
  };
}

export const documentUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES, files: 1 },
  fileFilter: makeFileFilter(DOCUMENT_UPLOAD_MIME_TYPES),
};

export const csvUploadOptions: MulterOptions = {
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES, files: 1 },
  fileFilter: makeFileFilter(CSV_UPLOAD_MIME_TYPES),
};
