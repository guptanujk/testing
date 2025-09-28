import express from 'express';
import claimController from '../controllers/claim.controller';
import commonHandler from '../middlewares/common';
import validations from '../validations/claims.validations';
import authentication from '../middlewares/authentication';
import requestErrorHandler from '../utilities/requestErrorHandler';

const router = express.Router();

router.post('/create', 
    commonHandler.validateInput,
    validations.createClaim,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    claimController.createClaim
);
router.post('/list',
    commonHandler.validateInput,
    validations.getClaimsList,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    claimController.getClaimsList   
);

router.put('/update/status',
    commonHandler.validateInput,
    validations.updateClaimStatus,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    claimController.updateClaimStatus   
);

router.post('/create/remark',
    commonHandler.validateInput,
    validations.createRemarkLog,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    claimController.createRemarkLog   
);

router.get('/remarks/history/:claimId',
    commonHandler.validateInput,
    validations.getRemarkHistory,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    claimController.getRemarkHistory   
);

router.post('/reclaim/:claimId',
    commonHandler.validateInput,
    validations.reclaim,
    requestErrorHandler.errorHandler,
    authentication.nonModulePermission,
    claimController.reclaim   
);

export default router;
