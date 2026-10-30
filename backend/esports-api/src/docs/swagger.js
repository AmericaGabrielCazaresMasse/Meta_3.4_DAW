import fs from 'node:fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

const file = fs.readFileSync(new URL('./openapi.yaml', import.meta.url), 'utf8');
const spec = YAML.parse(file);

const options = {
  customSiteTitle: 'API Jugadores y Rosters',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    docExpansion: 'none',          // todo cerrado al abrir
    defaultModelsExpandDepth: -1,  // oculta la sección "Schemas" de abajo
    displayRequestDuration: true,  // muestra cuánto tardó (RNF-03)
  },
};

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(spec, options);
export { spec };