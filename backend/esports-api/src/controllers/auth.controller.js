import * as service from '../services/auth.service.js';

const base = { sameSite: 'strict', secure: process.env.NODE_ENV === 'production' };

export async function login(req, res, next) {
  try {
    const { token, csrfToken, usuario } = await service.login(req.body ?? {});
    const maxAge = Number(process.env.COOKIE_MAX_AGE) || 3600000;

    res.cookie('jwt_token', token, { ...base, httpOnly: true, maxAge });
    res.cookie('csrf_token', csrfToken, { ...base, httpOnly: false, maxAge });
    res.status(200).json({ usuario, csrfToken });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('jwt_token', { ...base, httpOnly: true });
  res.clearCookie('csrf_token', base);
  res.status(204).send();
}

export function verify(req, res) {
  res.status(200).json({
    usuario: { id: req.user.sub, username: req.user.username, rol: req.user.rol },
    csrfToken: req.user.csrf,
  });
}