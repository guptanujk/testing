import express from 'express';
import { HttpStatus } from '../constants/httpStatusCodes'

export interface IError {
  status?: number;
  code?: number;
  message?: string;
}

export function notFoundErrorHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const swaggerApisPattern = /\/docs|api-docs/;
  if (swaggerApisPattern.test(req.url)) return next();
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: {
      message: "Not Found",
    },
  });
}

export function errorHandler(
  err: IError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) { 
  res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message:
        err.message || 'Internal Server Error',
    },
  });
}
