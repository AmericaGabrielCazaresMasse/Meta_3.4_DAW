import { DataTypes } from 'sequelize';

export default (sequelize) =>
  sequelize.define(
    'Usuario',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(100), allowNull: false },
      rol: { type: DataTypes.ENUM('Admin'), allowNull: false, defaultValue: 'Admin' },
    },
    { tableName: 'usuarios', underscored: true, timestamps: true }
  );