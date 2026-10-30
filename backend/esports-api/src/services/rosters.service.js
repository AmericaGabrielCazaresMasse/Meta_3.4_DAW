import { fn, col } from 'sequelize';
import { Roster, Jugador, RosterJugador } from '../models/index.js';
import { badRequest, notFound } from '../utils/httpError.js';

export const TIPOS = ['Principal', 'Academy'];

function validarDatos(data, { parcial = false } = {}) {
  if (!parcial || data.nombre !== undefined) {
    if (typeof data.nombre !== 'string' || data.nombre.trim() === '') {
      throw badRequest('El nombre es obligatorio');
    }
  }
  if (!parcial || data.tipo !== undefined) {
    if (!TIPOS.includes(data.tipo)) {
      throw badRequest(`Tipo inválido. Valores permitidos: ${TIPOS.join(', ')}`);
    }
  }
  if (!parcial || data.temporada !== undefined) {
    if (data.temporada === undefined || data.temporada === null || String(data.temporada).trim() === '') {
      throw badRequest('La temporada es obligatoria');
    }
  }
  if (data.juego !== undefined && (typeof data.juego !== 'string' || data.juego.trim() === '')) {
    throw badRequest('El juego no puede estar vacío');
  }
}

export async function listar({ tipo, temporada }) {
  const where = {};

  if (tipo !== undefined) {
    if (!TIPOS.includes(tipo)) throw badRequest(`Tipo inválido. Valores permitidos: ${TIPOS.join(', ')}`);
    where.tipo = tipo;
  }
  if (temporada !== undefined) where.temporada = String(temporada);

  const rosters = await Roster.findAll({
    where,
    attributes: {
      include: [[fn('COUNT', col('asignaciones.id')), 'cantidad_jugadores']],
      exclude: ['createdAt', 'updatedAt'],
    },
    include: [{ model: RosterJugador, as: 'asignaciones', attributes: [] }],
    group: ['Roster.id'],
    order: [['id', 'ASC']],
    subQuery: false,
  });

  return rosters.map((r) => {
    const json = r.toJSON();
    json.cantidad_jugadores = Number(json.cantidad_jugadores);
    return json;
  });
}

export async function obtener(id) {
  const roster = await Roster.findByPk(id, {
    attributes: ['id', 'nombre', 'juego', 'tipo', 'temporada'],
    include: [
      {
        model: Jugador,
        as: 'jugadores',
        attributes: ['id', 'nickname', 'rol'],
        through: { attributes: ['rol_en_roster'] },
      },
    ],
  });
  if (!roster) throw notFound('Roster no encontrado');

  const json = roster.toJSON();
  json.jugadores = json.jugadores.map((j) => ({
    id: j.id,
    nickname: j.nickname,
    rol: j.rol,
    rol_en_roster: j.RosterJugador.rol_en_roster,
  }));
  return json;
}

export async function crear(data) {
  validarDatos(data);
  const roster = await Roster.create({
    nombre: data.nombre.trim(),
    juego: data.juego?.trim(),
    tipo: data.tipo,
    temporada: String(data.temporada).trim(),
  });
  return obtener(roster.id);
}

export async function actualizar(id, data) {
  const roster = await Roster.findByPk(id);
  if (!roster) throw notFound('Roster no encontrado');

  validarDatos(data, { parcial: true });
  await roster.update({
    nombre: data.nombre?.trim(),
    juego: data.juego?.trim(),
    tipo: data.tipo,
    temporada: data.temporada !== undefined ? String(data.temporada).trim() : undefined,
  });
  return obtener(id);
}

export async function eliminar(id) {
  const roster = await Roster.findByPk(id);
  if (!roster) throw notFound('Roster no encontrado');
  // ON DELETE CASCADE borra solo las asignaciones; los jugadores permanecen (RN-05)
  await roster.destroy();
}