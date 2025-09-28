import express from 'express';
import userController from '../controllers/user.controller';
import commonHandler from '../middlewares/common';
import validations from '../validations/user.validations';
import authentication from '../middlewares/authentication';

const router = express.Router();

router.post('/login', 
 commonHandler.validateInput,
 validations.login,
 userController.loginVerification
),
router.post('/logout',
  commonHandler.validateInput,
  authentication.nonModulePermission,
  userController.userLogout,
);

export default router;
