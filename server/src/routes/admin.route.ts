import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';

const router = Router();

router.post('/match/:id/end', adminController.endMatch);
router.post('/match', adminController.createMatch);
router.post('/match/:id/start', adminController.startMatch);
router.post('/match/:id/event', adminController.triggerEvent);

export default router;
