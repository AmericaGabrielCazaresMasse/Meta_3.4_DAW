import { Router } from 'express';
import * as controller from '../controllers/rosters.controller.js';
import * as asignaciones from '../controllers/asignaciones.controller.js';

const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

router.get('/:id/jugadores', asignaciones.listar);
router.post('/:id/jugadores', asignaciones.asignar);
router.put('/:id/jugadores/:id_jugador', asignaciones.cambiarRol);
router.delete('/:id/jugadores/:id_jugador', asignaciones.quitar);

export default router;