import { body, param } from 'express-validator';
import locale from '../constants/locale';

const passwordValidation = (value: string) => {
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
  return passwordRegex.test(value);
};


const login = [
  body('email')
    .exists()
    .withMessage('Email is Required')
    .isString()
    .withMessage('Invalid Email')
    .isLength({ min: 1 })
    .withMessage('Email is Required')
    .isEmail()
    .withMessage('Invalid Email'),
  body('password')
    .trim()
    .exists()
    .withMessage('Password is Required')
    .isString()
    .withMessage('Invalid Password')
    .isLength({ min: 1 })
    .withMessage('Password is Required')
    .isLength({ min: 7, max: 15 })
    .withMessage('Password must be between 7 to 15 charaters only')
    .custom(passwordValidation)
    .withMessage(locale.PASSWORD_VALIDATION),
];


export default {
  
  login,
  
};
