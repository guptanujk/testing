import { body, oneOf, query, validationResult, param } from 'express-validator';

const passwordValidation = (value: string) => {
  const passwordRegex =
    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/;
  return passwordRegex.test(value);
};


const login = [
  body('email')
    .exists()
    .withMessage('Email is Required').bail()
    .isString()
    .withMessage('Invalid Email').bail()
    .isLength({ min: 1 })
    .withMessage('Email is Required').bail()
    .isEmail()
    .withMessage('Invalid Email').bail(),
  body('password')
    .trim()
    .exists()
    .withMessage('Password is Required').bail()
    .isString()
    .withMessage('Invalid Password').bail()
    .isLength({ min: 1 })
    .withMessage('Password is Required').bail()
    .isLength({ min: 7, max: 15 })
    .withMessage('Password must be between 7 to 15 charaters only').bail()
    .custom(passwordValidation)
    .withMessage('password must contain at least one uppercase letter, one lowercase letter, one special character and one number').bail(),
];


export default {
  login,
};
