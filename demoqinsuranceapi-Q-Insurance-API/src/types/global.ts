import { Request } from 'express';
import { IUserDetails } from './userTypes';

declare global {
  namespace Express {
    interface Request {
      user?: IUserDetails;
    }
  }
}