import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const logsDir = path.join(projectRoot, 'log');

const ensureLogsDir = () => {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};

const formatEntry = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${payload}\n`;
};

const writeLog = (level, message, meta = {}) => {
  ensureLogsDir();
  const filePath = path.join(logsDir, `${level.toLowerCase()}.log`);
  fs.appendFileSync(filePath, formatEntry(level, message, meta));
};

const logger = {
  info: (message, meta = {}) => writeLog('INFO', message, meta),
  warn: (message, meta = {}) => writeLog('WARN', message, meta),
  error: (message, meta = {}) => writeLog('ERROR', message, meta),
  debug: (message, meta = {}) => writeLog('DEBUG', message, meta),
};

export { logger };
