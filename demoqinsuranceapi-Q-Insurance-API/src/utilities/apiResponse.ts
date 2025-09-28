import { Response } from 'express';

export interface ICookie {
  key: string;
  value: string;
}
export default class ApiResponse {
  static result = (
    res: Response,
    data: any,
    status: number = 200,
    message: string = "SUCCESS",
  ) => {
    return res.status(status).json({
      data,
      message,
      success: true,
    });
  };

  static error = (
    res: Response,
    status: number,
    error: string,
  ) => {
    return res.status(status).json({
      error: {
        message: error,
      },
      success: false,
    });
  };
}
