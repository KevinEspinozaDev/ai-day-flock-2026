import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DomainError } from '../../../domain/errors.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof DomainError) {
    res.status(error.statusCode).json({ code: error.code, message: error.message });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }
  console.error(error);
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
}
