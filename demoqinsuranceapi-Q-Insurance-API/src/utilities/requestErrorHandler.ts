import { Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export default class RequestErrorHandler {
  static errorHandler = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const errors: any = validationResult(req).array();
    const details: string[] = [];
    if (errors && errors.length) {
      errors.forEach((error: any) =>
        details.push(error.msg)
      );
      const error = {
        error: {
          // message: details.join(', '),
          message: details[0],
        },
        success: false,
      };
      return res.status(400).json(error);
    } else {
      next();
    }
  };
  static error = (
    res: Response,
    errors: any,
  ) => {
    const details: string[] = [];
    errors.forEach((error: any) =>
      details.push(error.msg)
    );
    const error = {
      error: {
        // message: details.join(', '),
        message: details.join(', '),
      },
      success: false,
    };
    return res.status(400).json(error);
  };
}
