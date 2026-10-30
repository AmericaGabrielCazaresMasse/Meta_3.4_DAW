import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'RosterJugador',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      id_roster: { type: DataTypes.INTEGER, allowNull: false },
      id_jugador: { type: DataTypes.INTEGER, allowNull: false },
      rol_en_roster: {
        type: DataTypes.ENUM('Titular', 'Suplente'),
        allowNull: false,
      },
    },
    {
      tableName: 'roster_jugadores',
      underscored: true,
      timestamps: true,
    }
  );