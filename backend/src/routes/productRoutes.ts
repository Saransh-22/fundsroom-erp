import { Router } from 'express';
import * as productController from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

router.use(authMiddleware);

router.get('/products', roleMiddleware('Admin', 'Sales', 'Warehouse', 'Accounts'), productController.getProducts);
router.get('/products/:id', roleMiddleware('Admin', 'Sales', 'Warehouse', 'Accounts'), productController.getProductById);
router.post('/products', roleMiddleware('Admin', 'Warehouse'), productController.createProduct);
router.put('/products/:id', roleMiddleware('Admin', 'Warehouse'), productController.updateProduct);

router.get('/inventory', roleMiddleware('Admin', 'Sales', 'Warehouse', 'Accounts'), productController.getInventoryList);
router.get('/inventory/:productId', roleMiddleware('Admin', 'Sales', 'Warehouse', 'Accounts'), productController.getProductInventoryDetail);
router.get('/inventory/:productId/movements', roleMiddleware('Admin', 'Warehouse', 'Accounts'), productController.getStockMovements);
router.post('/inventory/:productId/adjust', roleMiddleware('Admin', 'Warehouse'), productController.adjustStock);

export default router;
