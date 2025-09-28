import { body, oneOf, query, validationResult, param } from 'express-validator';

const getCountries = [
  query('limit')
    .exists()
    .withMessage('Limit is Required').bail()
    .isNumeric()
    .withMessage('Invalid Limit').bail()
    .isLength({ min: 1 })
    .withMessage('Limit is Required').bail(),
  query('page')
    .exists()
    .withMessage('Page is Required').bail()
    .isNumeric()
    .withMessage('Invalid Page').bail()
    .isLength({ min: 1 })
    .withMessage('Page is Required').bail(),
];

const getStates = [
  query('limit')
    .exists()
    .withMessage('Limit is Required').bail()
    .isNumeric()
    .withMessage('Invalid Limit').bail()
    .isLength({ min: 1 })
    .withMessage('Limit is Required').bail(),
  query('page')
    .exists()
    .withMessage('Page is Required').bail()
    .isNumeric()
    .withMessage('Invalid Page').bail()
    .isLength({ min: 1 })
    .withMessage('Page is Required').bail(),
  query('countryId')
    .exists()
    .withMessage('CountryId is Required').bail()
    .isNumeric()
    .withMessage('Invalid CountryId').bail()
    .isLength({ min: 1 })
    .withMessage('CountryId is Required').bail(),
];


export default {
  getCountries,
  getStates,
};
