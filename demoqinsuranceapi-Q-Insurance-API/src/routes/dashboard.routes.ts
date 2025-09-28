import express from 'express';
import commonHandler from '../middlewares/common';
import validations from '../validations/claims.validations';
import authentication from '../middlewares/authentication';
import requestErrorHandler from '../utilities/requestErrorHandler';
import dashboardController from '../controllers/dashboard.controller';

const router = express.Router();

router.get('/admin/agentInfo', 
    commonHandler.validateInput,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    authentication.adminPermission,
    dashboardController.getAgentsCounts
);

router.get('/admin/policyInfo', 
    commonHandler.validateInput,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    authentication.adminPermission,
    dashboardController.getPolicyInfo
);

router.get('/admin/claimInfo', 
    commonHandler.validateInput,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    authentication.adminPermission,
    dashboardController.getClaimInfo
);


export default router;
