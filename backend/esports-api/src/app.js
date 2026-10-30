import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { swaggerServe, swaggerSetup } from './docs/swagger.js';
import authRoutes from './routes/auth.routes.js';
import auxiliaresRoutes from './routes/auxiliares.routes.js';
import jugadoresRoutes from './routes/jugadores.routes.js';
import rostersRoutes from './routes/rosters.routes.js';
import { autenticar } from './middlewares/auth.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Rol Público: solo lectura (GET). Rol Admin: el resto de métodos exige sesión.
const soloAdminParaEscribir = (req, res, next) =>
  req.method === 'GET' ? next() : autenticar(req, res, next);

app.use('/api-docs', swaggerServe, swaggerSetup);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', auxiliaresRoutes);
app.use('/api/v1/jugadores', soloAdminParaEscribir, jugadoresRoutes);
app.use('/api/v1/rosters', soloAdminParaEscribir, rostersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;