import { Router } from 'express';
import { ROLES, ESTADOS } from '../services/jugadores.service.js';
import { TIPOS } from '../services/rosters.service.js';

const router = Router();

router.get('/roles', (req, res) => {
  res.status(200).json(ROLES);
});

router.get('/estados', (req, res) => {
  res.status(200).json(ESTADOS);
});

router.get('/tipos-roster', (req, res) => {
  res.status(200).json(TIPOS);
});

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;