'use strict';
/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
  await queryInterface.createTable('jugadores', {
    id:{type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false },
    nickname:{type: Sequelize.STRING(50),
              allowNull: false,
              unique: true },
    nombre_real:{type: Sequelize.STRING(100),
                allowNull: true },
    pais:{type: Sequelize.STRING(60),
        allowNull: true },
    rol:{type: Sequelize.ENUM('Top', 'Jungle', 'Mid', 'ADC', 'Support'),
        allowNull: false },
    estado:{type: Sequelize.ENUM('activo', 'inactivo'),
            allowNull: false,
            defaultValue: 'activo' },
    created_at:{type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at:{type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });
},

async down(queryInterface, Sequelize) {
  await queryInterface.dropTable('jugadores');
}
};