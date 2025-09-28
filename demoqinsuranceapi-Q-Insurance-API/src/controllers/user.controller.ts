
import express, { Request, Response } from 'express';
import userService from '../services/user.service';
import pbkdf2 from 'pbkdf2';
import jwt from 'jsonwebtoken';
import apiResponse from '../utilities/apiResponse';
import { HttpStatus } from '../constants/httpStatusCodes';
import commonService from '../services/common.service';
import { logger } from '../helper/log4js/logger';

const salt = `${''}${process.env.JWTSECRETKEY}`;
const saltRounds = 10;
const rounds = 1000;
const keyLength = 32;
const alg = 'sha512';
const loginVerification = async (req: Request, res: Response) => {
  try {
    const email: string = req.body.email.trim().toLowerCase();
    const password: string = req.body.password;
    const dbName: string = process.env.MYSQLDATABASE || '';
    const userData: any = await userService.getTenantUserDetails(dbName, email);
    const hashPassword = pbkdf2.pbkdf2Sync(password, salt, rounds, keyLength, alg).toString('base64'); 
    if ( userData && userData.password === hashPassword) {
      if (userData.isActive === false) {
        return apiResponse.error(res, HttpStatus.BAD_REQUEST, 'User is deleted');
      }
      const tokenPayload = {
        id: userData.id,
        email: userData.email,
      };
      const token = jwt.sign(tokenPayload, salt, { expiresIn: 60 * 60 * 12 });
      delete userData['password'];
      delete userData['dbName'];
      delete userData['sessionKey']
      userData.token = token;
      return apiResponse.result(
        res,
        userData,
        HttpStatus.OK,
        'Login successful.',
      );
    }
    else {
      return apiResponse.error(
        res,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'username or password is incorrect.',
      );
    }
  }
  catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while checking data' : (error as Error).message;
    logger.error('Error at loginVerification ctrl: ', (error as Error).message);
    return apiResponse.error(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      err,
    );
  }
}
const userLogout = async (req: any, res: Response) => {
  try {
    req.session.destroy();
    return apiResponse.result(
      res,
      {},
      HttpStatus.OK,
      'Logout successful.',
    );
  } catch (error: any) {
    logger.error('Error at userLogout ctrl: ', error.message);
    return apiResponse.error(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }

}


export default {
  loginVerification,
  userLogout
};
