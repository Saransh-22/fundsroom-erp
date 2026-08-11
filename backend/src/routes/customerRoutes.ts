import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('Admin', 'Sales', 'Accounts'), customerController.getCustomers);
router.get('/:id', roleMiddleware('Admin', 'Sales', 'Accounts'), customerController.getCustomerById);
router.post('/', roleMiddleware('Admin', 'Sales'), customerController.createCustomer);
router.put('/:id', roleMiddleware('Admin', 'Sales'), customerController.updateCustomer);
router.get('/:id/notes', roleMiddleware('Admin', 'Sales', 'Accounts'), customerController.getCustomerNotes);
router.post('/:id/notes', roleMiddleware('Admin', 'Sales'), customerController.addCustomerNote);

export default router;
