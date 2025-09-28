import { body, oneOf, query, validationResult, param } from 'express-validator';



const createClaim = [
  body('userPolicyId')
    .exists()
    .withMessage('policyId is Required').bail()
    .isNumeric()
    .withMessage('Invalid policyId').bail()
    .isLength({ min: 1 })
    .withMessage('policyId is Required').bail(),
  body('remark')
    .optional({ nullable: true })
    .trim()
    .exists()
    .withMessage('Remark is Required').bail()
    .isString()
    .withMessage('Invalid Remark').bail()
    .isLength({ min: 1 })
    .withMessage('Remark is Required').bail(),
  body('amount')
    .optional({ nullable: true })
    .exists()
    .withMessage('claimAmount is Required').bail()
    .isNumeric()
    .withMessage('Invalid claimAmount').bail()
    .isLength({ min: 1 })
    .withMessage('claimAmount is Required').bail(),
];
const getClaimsList = [
  body('page')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Invalid page').bail()
    .isLength({ min: 1 })
    .withMessage('page is Required').bail(),
  body('limit')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Invalid limit').bail()
    .isLength({ min: 1 })
    .withMessage('limit is Required').bail(),
  body('search')
    .optional({ nullable: true })
    .trim()
    .isString()
    .withMessage('Invalid search').bail()
    .isLength({ min: 1 })
    .withMessage('search is Required').bail(),
  body('status')
    .optional({ nullable: true })
    .trim()
    .isIn(['Submitted','Approved','Rejected','Closed','Claim Issued'])
    .withMessage('Invalid status').bail()
    .isLength({ min: 1 })
    .withMessage('status is Required').bail(),
  body('createdOn')
    .optional({ nullable: true })
    .trim()
    .isString() 
    .withMessage('Invalid createdOn').bail()
    .isLength({ min: 1 })
    .withMessage('createdOn is Required').bail(),
  body('category')
    .optional({ nullable: true })
    .trim()
    .isIn(['Health', 'Life', 'Vehicle', 'Property'])
    .withMessage('Invalid category').bail()
    .isLength({ min: 1 })
    .withMessage('category is Required').bail(),
];

const updateClaimStatus = [
  body('claimId')
    .exists()
    .withMessage('claimId is Required').bail()
    .isNumeric()
    .withMessage('Invalid claimId').bail()
    .isLength({ min: 1 })
    .withMessage('claimId is Required').bail(),
  body('status')
    .exists()
    .withMessage('status is Required').bail()
    .isIn(['Approved','Rejected','Closed','Claim Issued'])
    .withMessage('Invalid status').bail()
    .isLength({ min: 1 })
    .withMessage('status is Required').bail(),
  body('remark')
    .optional({ nullable: true })
    .trim()
    .exists()
    .withMessage('Remark is Required').bail()
    .isString()
    .withMessage('Invalid Remark').bail()
    .isLength({ min: 1 })
    .withMessage('Remark is Required').bail(),
]

const createRemarkLog = [
  body('claimId')
    .exists()
    .withMessage('claimId is Required').bail()
    .isNumeric()
    .withMessage('Invalid claimId').bail()
    .isLength({ min: 1 })
    .withMessage('claimId is Required').bail(),
  body('remark')
    .exists()
    .withMessage('Remark is Required').bail()
    .isString()
    .withMessage('Invalid Remark').bail()
    .isLength({ min: 1 })
    .withMessage('Remark is Required').bail(),
]

const getRemarkHistory = [
  param('claimId')
    .exists()
    .withMessage('claimId is Required').bail()
    .isNumeric()
    .withMessage('Invalid claimId').bail()
    .isLength({ min: 1 })
    .withMessage('claimId is Required').bail(),
]

const reclaim = [
  param('claimId')
    .exists()
    .withMessage('claimId is Required').bail()
    .isNumeric()
    .withMessage('Invalid claimId').bail()
    .isLength({ min: 1 })
    .withMessage('claimId is Required').bail(),
  body('remark')
    .optional({ nullable: true })
    .trim()
    .exists()
    .withMessage('Remark is Required').bail()
    .isString()
    .withMessage('Invalid Remark').bail()
    .isLength({ min: 1 })
    .withMessage('Remark is Required').bail(),
]
export default {
  updateClaimStatus,
  createClaim,
  getClaimsList,
  createRemarkLog,
  getRemarkHistory,
  reclaim
};
