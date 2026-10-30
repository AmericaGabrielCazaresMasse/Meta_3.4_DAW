import * as service from '../services/asignaciones.service.js';
import { badRequest } from '../utils/httpError.js';

function parseId(valor, nombre = 'id') {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw badRequest(`${nombre} debe ser un entero positivo`);
  return id;
}

export async function listar(req, res, next) {
  try {
    res.status(200).json(await service.listar(parseId(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function asignar(req, res, next) {
  try {
    res.status(201).json(await service.asignar(parseId(req.params.id), req.body ?? {}));
  } catch (err) {
    next(err);
  }
}

export async function cambiarRol(req, res, next) {
  try {
    const idRoster = parseId(req.params.id);
    const idJugador = parseId(req.params.id_jugador, 'id_jugador');
    res.status(200).json(await service.cambiarRol(idRoster, idJugador, req.body ?? {}));
  } catch (err) {
    next(err);
  }
}

export async function quitar(req, res, next) {
  try {
    const idRoster = parseId(req.params.id);
    const idJugador = parseId(req.params.id_jugador, 'id_jugador');
    await service.quitar(idRoster, idJugador);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}