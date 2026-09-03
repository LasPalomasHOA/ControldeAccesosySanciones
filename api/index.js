import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const app = require('../Server/index.cjs');

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Fatal Serverless handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error crítico en función serverless',
        details: err.message
      });
    }
  }
}

