import { HttpStatus } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { AppError } from './errors.js';

export function parseWithZod<T>(
  schema: ZodSchema<T>,
  input: unknown,
  errorCode = 'VALIDATION_ERROR',
): T {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const fieldPath = firstIssue?.path?.join('.') || 'input';
    throw new AppError(
      errorCode,
      `Dữ liệu không hợp lệ tại ${fieldPath}: ${firstIssue?.message || 'Sai định dạng'}`,
      HttpStatus.BAD_REQUEST,
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertValidUuid(value: string, label = 'id'): string {
  if (!value || !UUID_REGEX.test(value)) {
    throw new AppError(
      'INVALID_UUID',
      `Mã định danh ${label} không hợp lệ.`,
      HttpStatus.BAD_REQUEST,
    );
  }
  return value.toLowerCase();
}
