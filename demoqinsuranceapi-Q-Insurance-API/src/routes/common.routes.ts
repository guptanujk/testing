import express from 'express';
import commonController from '../controllers/common.controller';
import commonHandler from '../middlewares/common';
import validations from '../validations/common.validations';
import authentication from '../middlewares/authentication';

const router = express.Router();

router.get('/countries', 
 commonHandler.validateInput,
 validations.getCountries,
 authentication.nonModulePermission,
 commonController.getCountries
);

router.get('/states', 
  commonHandler.validateInput,
  validations.getStates,
  authentication.nonModulePermission,
  commonController.getStates
 );


export default router;
