import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { autenticar } from '../middlewares/auth.js';

const router = Router();

router.post('/login', controller.login);
router.post('/logout', autenticar, controller.logout);
router.get('/verify', autenticar, controller.verify);

export default router;