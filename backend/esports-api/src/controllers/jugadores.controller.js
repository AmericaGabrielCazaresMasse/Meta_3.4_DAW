import * as service from '../services/jugadores.service.js';
import { badRequest } from '../utils/httpError.js';

function parseId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('El id debe ser un entero positivo');
  return id;
}

export async function listar(req, res, next) {
  try {
    res.status(200).json(await service.listar(req.query));
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    res.status(200).json(await service.obtener(parseId(req.params.id)));
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    res.status(201).json(await service.crear(req.body ?? {}));
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    res.status(200).json(await service.actualizar(parseId(req.params.id), req.body ?? {}));
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    await service.eliminar(parseId(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}