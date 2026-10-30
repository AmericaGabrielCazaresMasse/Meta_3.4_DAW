import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Roster',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: DataTypes.STRING(100), allowNull: false },
      juego: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'League of Legends',
      },
      tipo: { type: DataTypes.ENUM('Principal', 'Academy'), allowNull: false },
      temporada: { type: DataTypes.STRING(10), allowNull: false },
    },
    {
      tableName: 'rosters',
      underscored: true,
      timestamps: true,
    }
  );