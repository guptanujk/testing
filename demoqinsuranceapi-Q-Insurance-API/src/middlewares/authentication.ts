import { logger } from "../helper/log4js/logger";
import { HttpStatus } from '../constants/httpStatusCodes';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service';
import commonService from "../services/common.service";
const tokenProperty= `token`

const  nonModulePermission = async (req: any, res: any, next: any) => {
  try {
    const secretKey: any = process.env.JWTSECRETKEY
    const token = req.headers[tokenProperty];
    let decoded: any = jwt.verify(token, secretKey);
    if (decoded) {
        let dbName = process.env.MYSQLDATABASE || ''; 
        userService
        .getUserById(dbName,decoded.id)
        .then(async (userDetails: any) => {
          try {
          if (userDetails.isActive === false) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'User is deleted' });
          }
          req.user = userDetails;
          req.user.name = req.user.firstName? req.user.lastName? (req.user.lastName + ' ' +req.user.firstName): req.user.firstName:req.user.lastName?req.user.lastName: null;
          req.dbName = dbName;
          next();
        } catch(errr) {
          logger.error(errr);
          return res.status(500).json({ message:  'Something went wrong' });
        }
        })
        .catch ((Er:any) => {
          logger.error("Error at nonModulePermission ", Er);
          const err = commonService.isDBError(Er) ? 'Something went wrong' : (Er || Er?.message);
          return res.status(HttpStatus.UNAUTHORIZED).json({ message:  err });
        })
      // }).catch (E => {
      //   const er = commonService.isDBError(E) ? 'Something went wrong' : (E || E?.message);
      //   logger.error("Error at nonModulePermission ", E);
      //   return res.status(HttpStatus.UNAUTHORIZED).json({ message:  er });
      // })
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Sorry! Invalid Token' });
    }
  } catch (error: any) {
    const err = commonService.isDBError(error) ? 'Something went wrong' : error.message;
    logger.error("Error at nonModulePermission ", error.message);
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: err });
  }
};

const adminPermission = async (req: any, res: any, next: any) => {
  try {
    if (req?.user) {
        if (req?.user?.type === 'Admin') {
          next();
        } else {
          return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Sorry! You are not authorized to access this resource' });
        }
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Sorry! User details not found' });
    }
  } catch (error: any) {
    const err = commonService.isDBError(error) ? 'Something went wrong' : error.message;
    logger.error("Error at nonModulePermission ", error.message);
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: err });
  }
};


export default {
  nonModulePermission,
  adminPermission,
};
