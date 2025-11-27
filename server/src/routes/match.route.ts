import { Router } from 'express';
import * as matchController from '../controllers/match.controller';

const router = Router();

router.get('/matches', matchController.getMatches);
router.get('/matches/:id', matchController.getMatchDetail);

export default router;
