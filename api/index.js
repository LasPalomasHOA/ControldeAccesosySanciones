import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Importaciones estáticas para forzar a @vercel/nft a empaquetar todas las dependencias del backend
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import 'pg-hstore';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let app = null;
let loadError = null;

function getApp() {
  if (app) return app;
  if (loadError) throw loadError;

  const candidates = [
    path.resolve(__dirname, '../Server/index.cjs'),
    path.resolve(process.cwd(), 'Server/index.cjs'),
    path.resolve(__dirname, 'Server/index.cjs'),
    '../Server/index.cjs'
  ];

  let lastErr = null;
  for (const candidate of candidates) {
    try {
      if (typeof candidate === 'string' && path.isAbsolute(candidate) && !fs.existsSync(candidate)) {
        continue;
      }
      app = require(candidate);
      if (app) return app;
    } catch (err) {
      lastErr = err;
      // Si el error ocurrió dentro del propio código de Server/index.cjs (no al encontrar el archivo)
      if (!err.message || !err.message.includes('Cannot find module')) {
        loadError = err;
        throw err;
      }
    }
  }

  // Fallback final
  try {
    app = require('../Server/index.cjs');
    return app;
  } catch (err) {
    loadError = err || lastErr;
    throw loadError;
  }
}

export default function handler(req, res) {
  try {
    const expressApp = getApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Fatal Serverless handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error crítico en inicialización serverless',
        message: err.message,
        stack: err.stack,
        cwd: process.cwd(),
        dirname: __dirname,
        filesInCwd: fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : []
      });
    }
  }
}
