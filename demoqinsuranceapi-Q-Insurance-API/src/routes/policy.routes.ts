import express from 'express';
import policyController from '../controllers/policy.controller';
import commonHandler from '../middlewares/common';
import policyValidations from '../validations/policy.validations';
import authentication from '../middlewares/authentication';
import requestErrorHandler from '../utilities/requestErrorHandler';

const router = express.Router();

router.post('/user/create', 
 commonHandler.validateInput,
 policyValidations.createUserPolicy,
 requestErrorHandler.errorHandler,
 authentication.nonModulePermission,
 policyController.createUserPolicy
)

router.post('/list',
    commonHandler.validateInput,
    policyValidations.getPoliciesList,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    policyController.getPoliciesList
)

export default router;
