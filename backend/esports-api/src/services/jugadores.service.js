import { Op } from 'sequelize';
import { Jugador } from '../models/index.js';
import { badRequest, notFound, conflict } from '../utils/httpError.js';

export const ROLES = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
export const ESTADOS = ['activo', 'inactivo'];

const CAMPOS = ['id', 'nickname', 'nombre_real', 'pais', 'rol', 'estado'];

function validarDatos(data, { parcial = false } = {}) {
  if (!parcial || data.nickname !== undefined) {
    if (typeof data.nickname !== 'string' || data.nickname.trim() === '') {
      throw badRequest('El nickname es obligatorio');
    }
  }
  if (!parcial || data.rol !== undefined) {
    if (!ROLES.includes(data.rol)) {
      throw badRequest(`Rol inválido. Valores permitidos: ${ROLES.join(', ')}`);
    }
  }
  if (data.estado !== undefined && !ESTADOS.includes(data.estado)) {
    throw badRequest(`Estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
  }
}

async function verificarNicknameUnico(nickname, idExcluir = null) {
  const where = { nickname: nickname.trim() };
  if (idExcluir) where.id = { [Op.ne]: idExcluir };
  const existente = await Jugador.findOne({ where });
  if (existente) throw conflict(`El nickname "${nickname}" ya está en uso`);
}

export async function listar({ rol, estado, search }) {
  const where = {};

  if (rol !== undefined) {
    if (!ROLES.includes(rol)) throw badRequest(`Rol inválido. Valores permitidos: ${ROLES.join(', ')}`);
    where.rol = rol;
  }
  if (estado !== undefined) {
    if (!ESTADOS.includes(estado)) throw badRequest(`Estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
    where.estado = estado;
  }
  if (search) {
    where.nickname = { [Op.like]: `%${search}%` };
  }

  return Jugador.findAll({ where, attributes: CAMPOS, order: [['id', 'ASC']] });
}

export async function obtener(id) {
  const jugador = await Jugador.findByPk(id, { attributes: CAMPOS });
  if (!jugador) throw notFound('Jugador no encontrado');
  return jugador;
}

export async function crear(data) {
  validarDatos(data);
  await verificarNicknameUnico(data.nickname);

  const jugador = await Jugador.create({
    nickname: data.nickname.trim(),
    nombre_real: data.nombre_real,
    pais: data.pais,
    rol: data.rol,
    estado: data.estado,
  });
  return obtener(jugador.id);
}

export async function actualizar(id, data) {
  const jugador = await Jugador.findByPk(id);
  if (!jugador) throw notFound('Jugador no encontrado');

  validarDatos(data, { parcial: true });
  if (data.nickname !== undefined) {
    await verificarNicknameUnico(data.nickname, id);
  }

  await jugador.update({
    nickname: data.nickname?.trim(),
    nombre_real: data.nombre_real,
    pais: data.pais,
    rol: data.rol,
    estado: data.estado,
  });
  return obtener(id);
}

export async function eliminar(id) {
  const jugador = await Jugador.findByPk(id);
  if (!jugador) throw notFound('Jugador no encontrado');
  await jugador.destroy();
}