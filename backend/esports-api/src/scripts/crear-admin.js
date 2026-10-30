import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize, Usuario } from '../models/index.js';

const username = process.env.ADMIN_USER;
const password = process.env.ADMIN_PASS;

if (!username || !password) {
  console.error('Define ADMIN_USER y ADMIN_PASS en el .env');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);
const [, creado] = await Usuario.findOrCreate({
  where: { username },
  defaults: { password_hash: hash, rol: 'Admin' },
});

console.log(creado ? `Admin "${username}" creado` : `El usuario "${username}" ya existe`);
await sequelize.close();