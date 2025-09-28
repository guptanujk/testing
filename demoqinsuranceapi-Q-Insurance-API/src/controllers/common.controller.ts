
import express, { Request, Response } from 'express';
import userService from '../services/user.service';
import pbkdf2 from 'pbkdf2';
import jwt from 'jsonwebtoken';
import apiResponse from '../utilities/apiResponse';
import { HttpStatus } from '../constants/httpStatusCodes';
import commonService from '../services/common.service';
import { logger } from '../helper/log4js/logger';
import { IPagination, IGetStatesPayload } from '../types/common';

const paginationValidation = async (res: any, limit: any, page: any) => {
  return new Promise<{limit: number, skip: number, page: number}>((resolve, reject) => {
    try {
      if (page === undefined) {
        page = 1;
      }
      if (limit === undefined) {
        limit = 10;
      }
      if (page === '') {
        return apiResponse.error(res, HttpStatus.BAD_REQUEST, `Page is required`);
      }
      if (limit === '') {
        return apiResponse.error(
          res,
          HttpStatus.BAD_REQUEST,
          `Limit is required`,
        );
      }
      if (isNaN(Number(page))) {
        return apiResponse.error(
          res,
          HttpStatus.BAD_REQUEST,
          `Page should be number`,
        );
      }
      if (isNaN(Number(limit))) {
        return apiResponse.error(
          res,
          HttpStatus.BAD_REQUEST,
          `Limit should be number`,
        );
      }
      if (Number(page) < 1) {
        return apiResponse.error(
          res,
          HttpStatus.BAD_REQUEST,
          `Page should be greater than 0`,
        );
      }
      if (Number(limit) < 1) {
        return apiResponse.error(
          res,
          HttpStatus.BAD_REQUEST,
          `Limit should be greater than 0`,
        );
      }
      page = Number(page);
      limit = Number(limit);
      const skip = (page - 1) * limit;
      return resolve({
        limit,
        skip,
        page,
      })
    } catch (error) {
      return reject(error)
    }
  });
}
const getCountries = async (req: Request, res: Response) => {
  try {
    let limit: number = parseInt(req.query.limit as string, 10) || 1000;
    let page: number = parseInt(req.query.page as string, 10) || 1
    const skip = (page - 1) * limit;
    const payload: IPagination = {
      limit, skip
    }
    const countriesCount = await commonService.getAllCountriesCount();
    const totalCount = countriesCount.count || 0
    if (totalCount === 0) {
      return apiResponse.result(res, { limit, page, totalCount, data: [] });
    }
    const countries = await commonService.getAllCountries(payload);
    return apiResponse.result(
      res,
      { limit, page, totalCount, data: countries },
      HttpStatus.OK,
      'Counties list fetches successful.',
    );
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while checking data' : (error as Error).message;
    logger.error('Error at getCountries ctrl: ', (error as Error).message);
    return apiResponse.error(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      err,
    );
  }
}

const getStates = async (req: Request, res: Response) => {
  try {
    let countryId: number = parseInt(req.query.countryId as string, 10)
    let limit: number = parseInt(req.query.limit as string, 10) || 1000;
    let page: number = parseInt(req.query.page as string, 10) || 1
    const skip = (page - 1) * limit;
    const payload: IGetStatesPayload = {
      limit, skip, countryId
    }
    const country = await commonService.getCountryById(countryId)
    if (!country) {
      return apiResponse.error(
        res,
        HttpStatus.NOT_FOUND,
        'Country not found with given id',
      );
    }
    const countriesCount = await commonService.getAllCountryStatesCount(countryId);
    const totalCount = countriesCount.count || 0
    if (totalCount === 0) {
      return apiResponse.result(res, { limit, page, totalCount, data: [] });
    }
    const countryStates = await commonService.getAllCountryStates(payload);
    return apiResponse.result(
      res,
      { limit, page, totalCount, data: countryStates },
      HttpStatus.OK,
      'Country states list fetches successful.',
    );
  } catch (error: unknown) {
    const err = commonService.isDBError(error) ? 'Something went wrong while checking data' : (error as Error).message;
    logger.error('Error at getStates ctrl: ', (error as Error).message);
    return apiResponse.error(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      err,
    );
  }
}

export default {
  getCountries,
  getStates,
  paginationValidation
};
