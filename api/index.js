import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../Server/index.cjs');

export default app;
