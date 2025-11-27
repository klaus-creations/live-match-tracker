import { Router } from 'express';
import * as sseController from '../controllers/sse.controller';

const router = Router();

router.get('/matches', sseController.streamGlobalMatches);
router.get('/matches/:id', sseController.streamMatchDetail);

export default router;
