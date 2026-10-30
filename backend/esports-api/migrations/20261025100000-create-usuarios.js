export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('usuarios', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    username: { type: Sequelize.STRING(50), allowNull: false, unique: true },
    password_hash: { type: Sequelize.STRING(100), allowNull: false },
    rol: { type: Sequelize.ENUM('Admin'), allowNull: false, defaultValue: 'Admin' },
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('usuarios');
}