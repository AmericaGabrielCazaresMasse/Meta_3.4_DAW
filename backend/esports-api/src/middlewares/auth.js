import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../utils/httpError.js';

const METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS'];

export function autenticar(req, res, next) {
  const token = req.cookies?.jwt_token;
  if (!token) return next(unauthorized('No autenticado'));

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(unauthorized('Sesión inválida o expirada'));
  }

  // Protección CSRF: en métodos que modifican datos, el header debe coincidir con el del JWT
  if (!METODOS_SEGUROS.includes(req.method)) {
    if (req.get('x-csrf-token') !== payload.csrf) {
      return next(forbidden('Token CSRF inválido'));
    }
  }

  req.user = payload;
  next();
}