import 'dotenv/config';
import { Sequelize } from 'sequelize';
import defineJugador from './jugador.model.js';
import defineRoster from './roster.model.js';
import defineRosterJugador from './rosterJugador.model.js';
import defineUsuario from './usuario.model.js';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

const Jugador = defineJugador(sequelize);
const Roster = defineRoster(sequelize);
const RosterJugador = defineRosterJugador(sequelize);
const Usuario = defineUsuario(sequelize);


Jugador.belongsToMany(Roster, {
  through: RosterJugador,
  foreignKey: 'id_jugador',
  otherKey: 'id_roster',
  as: 'rosters',
});

Roster.belongsToMany(Jugador, {
  through: RosterJugador,
  foreignKey: 'id_roster',
  otherKey: 'id_jugador',
  as: 'jugadores',
});


Roster.hasMany(RosterJugador, { foreignKey: 'id_roster', as: 'asignaciones', onDelete: 'CASCADE' });
RosterJugador.belongsTo(Roster, { foreignKey: 'id_roster', as: 'roster' });
Jugador.hasMany(RosterJugador, { foreignKey: 'id_jugador', as: 'asignaciones', onDelete: 'CASCADE' });
RosterJugador.belongsTo(Jugador, { foreignKey: 'id_jugador', as: 'jugador' });

export { sequelize, Jugador, Roster, RosterJugador, Usuario };