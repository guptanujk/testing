import { HttpStatus } from "../constants/httpStatusCodes";
import apiResponse from "../utilities/apiResponse";

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


export {
  paginationValidation,
};
