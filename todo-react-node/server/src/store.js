import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const dataFile = path.join(dataDirectory, 'todos.json');

let writeQueue = Promise.resolve();

async function ensureDataFile() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFile, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeFile(dataFile, '[]', 'utf8');
  }
}

export async function readTodos() {
  await ensureDataFile();
  const content = await readFile(dataFile, 'utf8');

  try {
    const todos = JSON.parse(content);
    return Array.isArray(todos) ? todos : [];
  } catch {
    throw new Error('The task data file contains invalid JSON.');
  }
}

export async function writeTodos(todos) {
  writeQueue = writeQueue.then(async () => {
    await ensureDataFile();
    await writeFile(dataFile, JSON.stringify(todos, null, 2), 'utf8');
  });

  return writeQueue;
}
