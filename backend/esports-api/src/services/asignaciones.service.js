import { Op } from 'sequelize';
import { Roster, Jugador, RosterJugador } from '../models/index.js';
import { badRequest, notFound, conflict } from '../utils/httpError.js';

export const ROLES_EN_ROSTER = ['Titular', 'Suplente'];
const MAX_TITULARES = 5;

async function obtenerRoster(idRoster) {
  const roster = await Roster.findByPk(idRoster);
  if (!roster) throw notFound('Roster no encontrado');
  return roster;
}

function validarRolEnRoster(valor) {
  if (!ROLES_EN_ROSTER.includes(valor)) {
    throw badRequest(`rol_en_roster inválido. Valores permitidos: ${ROLES_EN_ROSTER.join(', ')}`);
  }
}

// Valida RN-02 y RN-03 antes de dejar a un jugador como Titular.
// idAsignacionExcluir: asignación que se está editando (para no compararla consigo misma).
async function validarTitular(idRoster, jugador, idAsignacionExcluir = null) {
  const where = { id_roster: idRoster, rol_en_roster: 'Titular' };
  if (idAsignacionExcluir) where.id = { [Op.ne]: idAsignacionExcluir };

  const titulares = await RosterJugador.findAll({
    where,
    include: [{ model: Jugador, as: 'jugador', attributes: ['id', 'nickname', 'rol'] }],
  });

  if (titulares.length >= MAX_TITULARES) {
    throw conflict(`El roster ya tiene ${MAX_TITULARES} titulares`);
  }

  const mismoRol = titulares.find((t) => t.jugador.rol === jugador.rol);
  if (mismoRol) {
    throw conflict(`Ya existe un titular con el rol ${jugador.rol} en este roster (${mismoRol.jugador.nickname})`);
  }
}

function formatear(asignacion, jugador) {
  return {
    id_roster: asignacion.id_roster,
    id_jugador: jugador.id,
    nickname: jugador.nickname,
    rol: jugador.rol,
    rol_en_roster: asignacion.rol_en_roster,
  };
}

export async function listar(idRoster) {
  await obtenerRoster(idRoster);

  const asignaciones = await RosterJugador.findAll({
    where: { id_roster: idRoster },
    include: [{ model: Jugador, as: 'jugador', attributes: ['id', 'nickname', 'rol'] }],
    order: [['id', 'ASC']],
  });

  return asignaciones.map((a) => formatear(a, a.jugador));
}

export async function asignar(idRoster, data) {
  await obtenerRoster(idRoster);

  const idJugador = Number(data.id_jugador);
  if (!Number.isInteger(idJugador) || idJugador <= 0) {
    throw badRequest('id_jugador es obligatorio y debe ser un entero positivo');
  }
  validarRolEnRoster(data.rol_en_roster);

  const jugador = await Jugador.findByPk(idJugador);
  if (!jugador) throw notFound('Jugador no encontrado');

  const existente = await RosterJugador.findOne({ where: { id_roster: idRoster, id_jugador: idJugador } });
  if (existente) throw conflict('El jugador ya está asignado a este roster');

  if (data.rol_en_roster === 'Titular') {
    await validarTitular(idRoster, jugador);
  }

  const asignacion = await RosterJugador.create({
    id_roster: idRoster,
    id_jugador: idJugador,
    rol_en_roster: data.rol_en_roster,
  });
  return formatear(asignacion, jugador);
}

export async function cambiarRol(idRoster, idJugador, data) {
  await obtenerRoster(idRoster);
  validarRolEnRoster(data.rol_en_roster);

  const asignacion = await RosterJugador.findOne({
    where: { id_roster: idRoster, id_jugador: idJugador },
    include: [{ model: Jugador, as: 'jugador', attributes: ['id', 'nickname', 'rol'] }],
  });
  if (!asignacion) throw notFound('El jugador no está asignado a este roster');

  if (data.rol_en_roster === 'Titular' && asignacion.rol_en_roster !== 'Titular') {
    await validarTitular(idRoster, asignacion.jugador, asignacion.id);
  }

  await asignacion.update({ rol_en_roster: data.rol_en_roster });
  return formatear(asignacion, asignacion.jugador);
}

export async function quitar(idRoster, idJugador) {
  await obtenerRoster(idRoster);

  const asignacion = await RosterJugador.findOne({ where: { id_roster: idRoster, id_jugador: idJugador } });
  if (!asignacion) throw notFound('El jugador no está asignado a este roster');

  await asignacion.destroy();
}