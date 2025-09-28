import * as express from 'express';

import userRoute from './user.routes';
import commonRoute from './common.routes';
import claimRoute from './claim.routes';
import policyRoute from './policy.routes';
import dashboardRoute from './dashboard.routes';

const router = express.Router();

router.use('/user', userRoute);
router.use('/policy', policyRoute);
router.use('/common', commonRoute);
router.use('/claim', claimRoute);
router.use('/dashboard', dashboardRoute);

export default router;
