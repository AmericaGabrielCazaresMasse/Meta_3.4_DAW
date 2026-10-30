'use strict';
/** @type {import('sequelize-cli').Migration} */

export default {
    async up(queryInterface, Sequelize) {
  await queryInterface.createTable('roster_jugadores', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    id_roster: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'rosters', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    id_jugador: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'jugadores', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    rol_en_roster: { type: Sequelize.ENUM('Titular', 'Suplente'), allowNull: false },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });


  await queryInterface.addConstraint('roster_jugadores', {
    fields: ['id_roster', 'id_jugador'],
    type: 'unique',
    name: 'uq_roster_jugador',
  });
},

 async down(queryInterface) {
  await queryInterface.dropTable('roster_jugadores');
}
}