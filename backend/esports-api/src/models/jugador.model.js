import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Jugador',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nickname: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      nombre_real: { type: DataTypes.STRING(100), allowNull: true },
      pais: { type: DataTypes.STRING(60), allowNull: true },
      rol: {
        type: DataTypes.ENUM('Top', 'Jungle', 'Mid', 'ADC', 'Support'),
        allowNull: false,
      },
      estado: {
        type: DataTypes.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo',
      },
    },
    {
      tableName: 'jugadores',
      underscored: true,
      timestamps: true,
    }
  );