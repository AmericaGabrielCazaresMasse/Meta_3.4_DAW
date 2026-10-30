'use strict';
/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable('rosters', {
    id: { 
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false },
    nombre: { 
      type: Sequelize.STRING(100),
      allowNull: false },
    juego: {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'League of Legends' },
    tipo: { 
      type: Sequelize.ENUM('Principal', 'Academy'),
      allowNull: false },
    temporada: {
       type: Sequelize.STRING(10),
       allowNull: false },
    created_at: {
      type: Sequelize.DATE, allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });
},

 async down(queryInterface) {
  await queryInterface.dropTable('rosters');
}
}