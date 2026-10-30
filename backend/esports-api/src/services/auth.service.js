import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/index.js';
import { badRequest, unauthorized } from '../utils/httpError.js';

export async function login({ username, password }) {
  if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
    throw badRequest('username y password son obligatorios');
  }

  const usuario = await Usuario.findOne({ where: { username: username.trim() } });
  const valido = usuario && (await bcrypt.compare(password, usuario.password_hash));
  if (!valido) throw unauthorized('Credenciales inválidas');

  // El token CSRF viaja dentro del JWT y también se devuelve al cliente
  const csrfToken = crypto.randomBytes(32).toString('hex');
  const token = jwt.sign(
    { sub: usuario.id, username: usuario.username, rol: usuario.rol, csrf: csrfToken },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  return {
    token,
    csrfToken,
    usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol },
  };
}