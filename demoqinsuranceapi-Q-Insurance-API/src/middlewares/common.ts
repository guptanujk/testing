import { Response, NextFunction } from 'express';
import { HttpStatus } from "../constants/httpStatusCodes";
import { logger } from "../helper/log4js/logger";
import xss from 'xss';
const tokenProperty= `${process.env.NODE_ENV}_token`


const validateInput = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.body && Object.keys(req.body).length) {
      for (let i in req.body) {
        if (typeof (req.body[i]) === 'string') {
          req.body[i] = sanitizedOutput(req.body[i]);
        }
        if (Array.isArray(req.body[i])) {
          req.body[i] = req.body[i].map((ele: any) => {
            if (typeof (ele) === 'string') {
              return sanitizedOutput(ele);
            } else {
              return ele;
            }
          });
        }
      }
    }
    if (req.query) {
      for (let i in req.query) {
        if (typeof (req.query[i]) === 'string') {
          req.query[i] = sanitizedOutput(req.query[i]);
        }
      }
    }
    if (req.params) {
      for (let i in req.params) {
        if (typeof (req.params[i]) === 'string') {
          req.params[i] = sanitizedOutput(req.params[i]);
        }
      }
    }
    next();
  } catch (error: any) {
    logger.error("Error at validateInput ", error.message);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const sanitizedOutput = (ele: any) => {
  let sanitizeReq = xss(ele, {
    stripIgnoreTagBody: ["script", 'iframe']
  });
  return sanitizeReq;
};
const clearCookie = (req: any, res: Response) =>{
  res.cookie(tokenProperty,'',{domain: process.env.COOKIE_DOMAIN})
  res.clearCookie(tokenProperty,{domain: process.env.COOKIE_DOMAIN});
  req.session.destroy();
}
export default{
  validateInput,
  clearCookie
};
