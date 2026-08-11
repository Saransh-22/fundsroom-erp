import { Router } from 'express';
import * as challanController from '../controllers/challanController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('Admin', 'Sales'), challanController.createChallan);
router.get('/', roleMiddleware('Admin', 'Sales', 'Accounts'), challanController.getChallans);
router.get('/:id', roleMiddleware('Admin', 'Sales', 'Accounts'), challanController.getChallanById);
router.post('/:id/confirm', roleMiddleware('Admin', 'Sales'), challanController.confirmChallan);

export default router;
