import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { readTodos, writeTodos } from './store.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

app.use(cors());
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/todos', async (req, res, next) => {
  try {
    const todos = await readTodos();
    res.json(todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    next(error);
  }
});

app.post('/api/todos', async (req, res, next) => {
  try {
    const title = validateTitle(req.body.title);
    const todos = await readTodos();
    const now = new Date().toISOString();
    const newTodo = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    todos.push(newTodo);
    await writeTodos(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
});

app.patch('/api/todos/:id', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const todoIndex = todos.findIndex((todo) => todo.id === req.params.id);

    if (todoIndex === -1) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const updatedTodo = { ...todos[todoIndex] };

    if (Object.hasOwn(req.body, 'title')) {
      updatedTodo.title = validateTitle(req.body.title);
    }

    if (Object.hasOwn(req.body, 'completed')) {
      if (typeof req.body.completed !== 'boolean') {
        return res.status(400).json({ message: 'Completed must be true or false.' });
      }
      updatedTodo.completed = req.body.completed;
    }

    updatedTodo.updatedAt = new Date().toISOString();
    todos[todoIndex] = updatedTodo;
    await writeTodos(todos);
    res.json(updatedTodo);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/todos/completed/all', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const remainingTodos = todos.filter((todo) => !todo.completed);
    const deletedCount = todos.length - remainingTodos.length;
    await writeTodos(remainingTodos);
    res.json({ deletedCount });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/todos/:id', async (req, res, next) => {
  try {
    const todos = await readTodos();
    const remainingTodos = todos.filter((todo) => todo.id !== req.params.id);

    if (remainingTodos.length === todos.length) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await writeTodos(remainingTodos);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    next(error);
  }
});

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((error, req, res, next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Internal server error.' : error.message,
  });
});

function validateTitle(value) {
  if (typeof value !== 'string') {
    const error = new Error('Task title is required.');
    error.status = 400;
    throw error;
  }

  const title = value.trim();
  if (!title) {
    const error = new Error('Task title cannot be empty.');
    error.status = 400;
    throw error;
  }

  if (title.length > 120) {
    const error = new Error('Task title cannot be longer than 120 characters.');
    error.status = 400;
    throw error;
  }

  return title;
}

app.listen(PORT, () => {
  console.log(`To-Do server running at http://localhost:${PORT}`);
});
