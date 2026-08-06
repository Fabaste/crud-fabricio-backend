import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '../src/logs/logger.js';

test('logger writes entries to the info log file', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const logDir = path.resolve(__dirname, '../logs');
  const infoFile = path.join(logDir, 'info.log');

  if (fs.existsSync(infoFile)) {
    fs.rmSync(infoFile, { force: true });
  }

  logger.info('mensaje de prueba', { context: 'test' });

  assert.ok(fs.existsSync(infoFile), 'El archivo info.log debe existir');
  const content = fs.readFileSync(infoFile, 'utf8');
  assert.match(content, /mensaje de prueba/);
  assert.match(content, /INFO/);
});
